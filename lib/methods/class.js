const cache = require('../cache')

function classMethods (client, model) {
  return {
    client () {
      return client
    },
    create () {
      return model.create.apply(model, arguments)
      .then(instance => {
        return cache.save(client, instance)
      })
    },
    findById (id) {
      return cache.get(client, model, id, Array.from(arguments || {}).pop())
      .then(instance => {
        if (instance) {
          return instance
        }

        return model.findById.apply(model, arguments)
        .then(instance => cache.save(client, instance))
      })
    },
    upsert (data) {
      return model.upsert.apply(model, arguments).then(created => {
        return cache.save(client, model.build(data))
        .then(() => created)
      })
    },
    insertOrUpdate () {
      return this.upsert.apply(this, arguments)
    }
  }
}

module.exports = classMethods
