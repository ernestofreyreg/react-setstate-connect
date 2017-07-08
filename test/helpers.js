const { JSDOM } = require('jsdom')
const exposedProperties = ['window', 'navigator', 'document']

const dom = new JSDOM('<!DOCTYPE html><div></div>')
global.window = dom.window
global.document = global.window.document
Object.keys(global.window).forEach((property) => {
  if (global[property] === undefined) {
    exposedProperties.push(property)
    global[property] = document.defaultView[property]
  }
})

global.navigator = {
  userAgent: 'node.js'
}
global.location = {}
