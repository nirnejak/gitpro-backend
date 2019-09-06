module.exports = fetchCollaborators = async (saved_user) => {
  User.findOne({ login: saved_user.login }, (err, user) => {
    if (err) {
      console.log(chalk.red("❗️  User not found!"))
    } else {
      for (let j = 0; j < user.repositories.length; j++) {
        let res_collaborators = await axios.get(`https://api.github.com/repos/${user.login}/${user.repositories[j].name}/collaborators`, { headers: { Authorization: `Bearer ${user.token}`, } })
        if (res_collaborators.data.length > 1) {
          let collaborators = res_collaborators.data.filter(contributor => contributor.login !== user.login)
          collaborators = collaborators.map(contributor => ({
            login: contributor.login,
            id: contributor.id,
            type: contributor.type
          }))
          user.collaborators = [...user.collaborators, ...collaborators]
        }

        // Saving instance on the last iteration
        if (user.repositories.length - 1 === j) {
          return await user.save()
        }
      }
    }
  })
}