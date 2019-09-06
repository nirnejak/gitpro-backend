module.exports = fetchRepositories = async (saved_user) => {
  User.findOne({ login: saved_user.login }, (err, user) => {
    if (err) {
      console.log(chalk.red("❗️  User not found!"))
    } else {
      const res = await axios.get("https://api.github.com/user/repos", { headers: { Authorization: `Bearer ${user.token}`, } })
      // Filtering User's repositories only, omitting repositories shared with him/her
      let data = res.data.filter(repo => repo.owner.login === user.login)
      user.repositories = data.map(repo => {
        const { id, node_id, name, private, description, language } = repo;
        return { id, node_id, name, private, description, language }
      })
      return await user.save()
    }
  })
}