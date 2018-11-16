/* eslint-disable no-undef */
$('form').submit(() => {
  const username = $('form input').val()
  console.log(`examining ${username}`)

  // Fetch data for given user
  // (https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
  fetch(`${USER_URL}/${username}`)
    .then(response => response.json()) // Returns parsed json data from response body as promise
    .then(data => {
      console.log(`Got data for ${username}`)
      console.log(data)
      if (data === null) {
        throw err
      }
      for (let key in data) {
        if(data[key] === null) {
          delete data[key]
        }
      }
      console.log(`Cleaned data for ${username}`)
      console.log(data)

      $('.user-error').addClass('hide')
      $('.username').empty().text(data.username)
      $('.full-name').empty().text(data.name)
      $('.location').empty().text(data.location)
      $('.email').empty().text(data.email)
      $('.bio').empty().text(data.bio)
      $('.avatar').empty().attr("src",data.avatar_url)
      $('.titles').empty().text(data.titles)
      $('.favorite-language').empty().text(data.favorite_language)
      $('.total-stars').empty().text(data.total_stars)
      $('.most-starred').empty().text(data.highest_starred)
      $('.public-repos').empty().text(data.public_repos)
      $('.perfect-repos').empty().text(data.perfect_repos)
      $('.followers').empty().text(data.followers)
      $('.following').empty().text(data.following)

      $('.user-results').removeClass('hide')
    })
    .catch(err => {
      $('.user-results').addClass('hide')
      console.log(`Error getting data for ${username}`)
      console.log(err)
      /*
        TODO
        If there is an error finding the user, instead toggle the display of the '.user-error' element
        and populate it's inner span '.error' element with an appropriate error message
      */
      $('.error').empty().text(`Error getting data for ${username}`)
      $('.user-error').append($('<span></span>').text(err))
      $('.user-error').removeClass('hide')
    })

  return false // return false to prevent default form submission
})
