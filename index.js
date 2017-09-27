#!/usr/bin/env node
const https = require('https')
const pkg = require('./package.json')

const {URL} = require('url')
const webhook = new URL(process.env.SLACK_WEBHOOK)

const requestOpts = {
  hostname: webhook.hostname,
  port: 443,
  path: webhook.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
}
let [a, b, ...params] = process.argv
let args = {}
params.forEach((param) => {
  const pos = param.indexOf('=')
  args[param.slice(2, pos)] = param.slice(pos + 1)
})

function postNow (data = {}) {
  console.log(data)
  const stringified = JSON.stringify(data)
  requestOpts.headers['Content-Length'] = Buffer.byteLength(stringified)
  const req = https.request(requestOpts, (res) => {
    res.setEncoding('utf8')
    res.on('data', (d) => {
      process.stdout.write(d)
    })
  })
  req.on('error', (err) => {
    console.log(err, 3)
  })
  req.end(stringified)
}

postNow({
  channel: process.env.SLACK_CHANNEL,
  'attachments': [
    {
      'fallback': 'Required plain-text summary of the attachment.',
      'color': '#36a64f',
      'author_name': `${process.env.CI_PROJECT_PATH} Job ${process.env.CI_JOB_ID}`,
      'author_link': `${process.env.CI_PROJECT_URL}/builds/${process.env.CI_JOB_ID}`,
      'author_icon': 'http://flickr.com/icons/bobby.jpg',
      'title': process.env.CI_PROJECT_PATH,
      'title_link': process.env.CI_PROJECT_URL,
      'fields': [
        {
          'title': 'Triggered by',
          'value': `${process.env.GITLAB_USER_LOGIN} (${process.env.GITLAB_USER_NAME})`,
          'short': false
        },
        {
          'title': 'Deployed to',
          'value': `<${args.url1}|${args.name1}>`,
          'short': false
        }
      ],
      'image_url': 'http://my-website.com/path/to/image.jpg',
      'thumb_url': 'http://example.com/path/to/thumb.png',
      'footer': `${pkg.name} v${pkg.version}`,
      'footer_icon': 'https://platform.slack-edge.com/img/default_application_icon.png'

    }
  ]
})
