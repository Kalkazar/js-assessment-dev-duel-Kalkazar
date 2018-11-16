import { Router } from 'express'
import axios from 'axios'
import validate from 'express-validation'
import token from '../../token'

import validation from './validation'
import APIError from '../lib/APIError';

function isEmpty(obj) {
  for(let key in obj) {
      return false
  }
  return true
}

const axiosGet = endpoint =>
  axios.get(`https://api.github.com/users/${endpoint}`, {
    headers: {
      'Authorization': token
    }
  }).then(response => response.data)

const axiosGetUser = userName =>
  Promise.all([axiosGet(`${userName}`),axiosGet(`${userName}/repos`)])
    .then(dataArray => {
      let titles = []
      let languages = {}
      let favLanguage = "(none)"
      let stats = [0,0,0,0]

      for (let repo of dataArray[1]) {
        if (repo['language'] in languages) {
          languages[repo['language']] += 1
        } else {
          languages[repo['language']] = 0
        }
        stats[0] += (repo['fork'] ? 1 : 0)
        stats[1] += repo['stargazers_count']
        stats[2] = (stats[2] > repo['stargazers_count'] ? stats[2] : repo['stargazers_count'])
        stats[3] += (repo['open_issues'] === 0 ? 1 : 0)
      }

      // Add titles to the "titles" array
      if (!isEmpty(dataArray[1]) && (stats[0]*2) >= dataArray[1].length) {
        titles.push(" Forker")
      }
      if (languages.length === 1) {
        titles.push(" One-Trick Pony")
      }
      if (languages.length > 10) {
        titles.push(" Jack of all Trades")
      }
      if (dataArray[0].following === dataArray[0].followers) {
        titles.push(dataArray[0].following === 0 ? " Lonely" : " Balanced")
      } else {
        if ((dataArray[0].following * 2) >= dataArray[0].followers) {
          titles.push(" Stalker")
        }
        if (dataArray[0].following <= (dataArray[0].followers * 2)) {
          titles.push(" Mr. Popular")
        }
      }

      // If "language" object is empty, add one last title
      // Else, choose key with the highest value
      if (isEmpty(languages)) {
        titles.push(" Illiterate")
      } else {
        favLanguage = Object.keys(languages).reduce((a, b) => {
          return languages[a] > languages[b] ? a : b 
        })// isn't this kinda outa place? should it be in its own section? Maybe do something with a .contains() method
      }

      // If the titles array is empty, replace it with "(none)"
      // Else, remove space at beginning of first title (for easier reading)
      if (titles.length === 0) {
        titles = "(none)"
      } else {
        titles[0].substring(1)
      }
      return {
        'username': dataArray[0].login, 
        'name': dataArray[0].name,
        'location': dataArray[0].location,
        'email': dataArray[0].email,
        'bio': dataArray[0].bio,
        'avatar_url': dataArray[0].avatar_url,
        'titles': titles,
        'favorite_language': favLanguage,
        'public_repos': dataArray[0].public_repos,
        'total_stars': stats[1],
        'highest_starred': stats[2],
        'perfect_repos': stats[3],
        'followers': dataArray[0].followers,
        'following': dataArray[0].following
      }
    })


export default () => {
  let router = Router()

  /** GET /health-check - Check service health */
  router.get('/health-check', (req, res) => res.send('OK'))

  /** GET /api/rate_limit - Get github rate limit for your token */
  router.get('/rate', (req, res) => {
    axiosGet(`http://api.github.com/rate_limit`)
      .then( (data) => res.json(data) )
  })

  /** GET /api/user/:username - Get user */
  router.get('/user/:username', validate(validation.user), (req, res, next) => {
    axiosGetUser(req.params.username)
      .then(user => res.json(user))
      .catch(err => {
        console.log(err)
        next(new APIError('Error'))
      })
  })

  /** GET /api/users? - Get users */
  router.get('/users/', validate(validation.users), (req, res) => {
    let promiseArray = []
    for (let i in req.query.username) {
      promiseArray.push(axiosGetUser(req.query.username[i]))
    }
    Promise.all(promiseArray).then(users => res.json(users))
  })

  return router
}
