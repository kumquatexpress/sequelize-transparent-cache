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
    findById (id, options, refresh) {
      const arrArgs = Array.from(arguments)
      if (arrArgs.length > 2) {
        refresh = arrArgs.pop()
        delete arguments[2]
      }

      return cache.get(client, model, id, arrArgs.pop())
      .then(instance => {
        if (!refresh && instance) {
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
    },
    refresh (id) {
      return model.findById.apply(model, arguments)
      .then(instance => cache.destroy(client, instance))
    }
  }
}

module.exports = classMethods
