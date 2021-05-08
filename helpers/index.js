module.exports.removeUnwantedProperties = (model, properties) => {
    let modelKeys = Object.keys(model)
    modelKeys = modelKeys.filter(modelKey => !properties.includes(modelKey))
    let newModel = {}
    modelKeys.forEach(modelKey => newModel[modelKey] = model[modelKey])
    return newModel
}