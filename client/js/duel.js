/* eslint-disable no-undef */

const calculateScore = (data) => {
  let score = data.total_stars + data.highest_starred
              + data.public_repos + data.perfect_repos
              + data.followers + data.following
  return score
}

$('form').submit(() => {
  const usernames = { 'left': $('#left').val(), 'right': $('#right').val() }
  const compare = []
  let scoreboard = []
  let arrow = ""
  let winner = ""
  let message = ""
  
  for(let side in usernames) {
    console.log(`examining ${side} user, "${usernames[side]}".`)

    fetch(`${USER_URL}/${usernames[side]}`)
      .then(response => response.json()) // Returns parsed json data from response body as promise
      .then(data => {
        compare.push(data)
        if (data === null) {
          throw err
        }
        for (let key in data) {
          if(data[key] === null) {
            delete data[key]
          }
        }
        console.log(`Cleaned data for ${usernames[side]}`)
        console.log(data)
        $('.user-error').addClass('hide')

        $(`.${side} > .username`).empty().text(data.username)
        $(`.${side} > .full-name`).empty().text(data.name)
        $(`.${side} > .location`).empty().text(data.location)
        $(`.${side} > .email`).empty().text(data.email)
        $(`.${side} > .bio`).empty().text(data.bio)
        $(`.${side} > .avatar`).empty().attr("src",data.avatar_url)
        $(`.${side} > .stats > .stat > .titles`).empty().text(data.titles)
        $(`.${side} > .stats > .stat > .favorite-language`).empty().text(data.favorite_language)
        $(`.${side} > .stats > .stat > .total-stars`).empty().text(data.total_stars)
        $(`.${side} > .stats > .stat > .highest-starred`).empty().text(data.highest_starred) // ERROR HERE!
        $(`.${side} > .stats > .stat > .public-repos`).empty().text(data.public_repos)
        $(`.${side} > .stats > .stat > .perfect-repos`).empty().text(data.perfect_repos)
        $(`.${side} > .stats > .stat > .followers`).empty().text(data.followers)
        $(`.${side} > .stats > .stat > .following`).empty().text(data.following)
        $(`.${side} > .stats > .stat > .score`).empty().text(calculateScore(data))

        if (compare.length > 1) {
          let left = calculateScore(compare[0])
          let right = calculateScore(compare[1])
          if (left > right) {
            arrow = ">"
            winner = `${compare[0].username} wins!`
            message = `${compare[0].username} beat out ${compare[1].username} with a score of ${left} to ${right}`
          } else  if (left < right) {
            arrow = "<"
            winner = `${compare[1].username} wins!`
            message = `${compare[1].username} beat out ${compare[0].username} with a score of ${left} to ${right}`
          } else {
            arrow = "=="
            winner = "It's a Tie!"
            message = "both users had the exact same number of activity points"
          }
          $('.victor').append($('<span class="arrow"></span>').text(arrow))
          $('.victor').append($('<span class="winner"></span>').text(winner))
          $('.victor').append($('<span><p></p></span>').text(message))        }

        $('.duel-container, .victor').removeClass('hide') // Display '.user-results' element
      })
      .catch(err => {
        $('.duel-container, .victor').addClass('hide')
        console.log(`Error getting data for ${usernames[side]}`)
        console.log(err)
        /* 
          TODO
          If there is an error finding the user, instead toggle the display of the '.user-error' element
          and populate it's inner span '.error' element with an appropriate error message
        */
        $('.error').empty().text(`Error getting data for ${usernames[side]}`)
        $('.user-error').append($('<h1></h1>').text(err))
        $('.user-error').removeClass('hide')
      })
  }
  return false // return false to prevent default form submission
})

/*
  TODO
  Fetch 2 user's github data and display their profiles side by side
  If there is an error in finding user or both users, display appropriate error
  message stating which user(s) doesn't exist

  It is up to the student to choose how to determine a 'winner'
  and displaying their profile/stats comparison in a way that signifies who won.
 */
