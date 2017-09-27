#!/usr/bin/env node
const https = require('https')
const path = require('path')
const pkg = require(path.join(process.env.CI_PROJECT_DIR, 'package.json'))

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
  // Only add Deploy to field where necessary.
  if (args.url1) {
    let deployedTo = `<${args.url1}|${args.name1}> `
    if (args.url2) {
      deployedTo += `<${args.url2}|${args.name2}> `
    }
    if (args.url3) {
      deployedTo += `<${args.url3}|${args.name3}> `
    }
    data.attachments[0].fields[1] = {
      'title': 'Deployed to',
      'value': deployedTo,
      'short': true
    }
  }
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
    console.error(err, 3)
  })
  req.end(stringified)
}

postNow({
  channel: process.env.SLACK_CHANNEL,
  attachments: [
    {
      fallback: 'Required plain-text summary of the attachment.',
      'color': '#36a64f',
      'author_name': `Job #${process.env.CI_JOB_ID}`,
      'author_link': `${process.env.CI_PROJECT_URL}/builds/${process.env.CI_JOB_ID}`,
      'author_icon': process.env.SLACK_AUTHOR_ICON,
      title: `${process.env.CI_PROJECT_PATH} (${process.env.CI_ENVIRONMENT_SLUG})`,
      'title_link': process.env.CI_PROJECT_URL,
      'fields': [
        {
          title: 'Triggered by',
          'value': `${process.env.GITLAB_USER_EMAIL}`,
          'short': true
        }
      ],
      'image_url': process.env.SLACK_IMAGE_URL,
      'thumb_url': process.env.SLACK_THUMB_URL,
      'footer': `${pkg.name} v${pkg.version}`,
      'footer_icon': process.env.SLACK_FOOTER_ICON || 'https://platform.slack-edge.com/img/default_application_icon.png'

    }
  ]
})
