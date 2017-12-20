#!/usr/bin/env node 

var shell = require('shelljs')
var fs = require('fs')
var exec = shell.exec
const spawn = require('child_process').spawnSync

var config = initConfig()
var argv = initArgv()
if (! setupConfig()) {
  return
}
createPodfileLocal()
updatePod()




function initConfig() {
  shell.cd('~')
  try {
    var config = JSON.parse(fs.readFileSync('.easy_pod_config.json'))
  } catch(err) {
  }

  if (! config) {
    config = {}
  }
  return config
}

function initArgv() {
  return require('yargs').option('w', {
    alias : 'workspace',
    demand: false,
    describe: 'workspace 所在的文件夹路径' + (config.workspace ? '(已设置)' : '（未设置)'),
    type: 'string'
  }).option('p', {
    alias: 'pod',
    demand: false,
    describe: 'pod 所在的文件夹路径' + (config.pod ? '(已设置)' : '（未设置)'),
    type: 'string'
  }).option('u', {
    alias: 'update',
    demand: false,
    default: 'false',
    describe: '是否更新 repo 库',
    type: 'boolean'
  }).option('c', {
    alias: 'config',
    demand: false,
    default: 'false',
    describe: '查看路径配置',
    type: 'boolean'
  }).argv
}

function setupConfig() {
  if (argv.config) {
    shell.echo(config)
    return false
  }

  if (argv.workspace) {
    config.workspace = argv.workspace
    shell.echo('workspace 路径设置成功, 为', argv.workspace)
  }
  if (argv.pod) {
    config.pod = argv.pod
    shell.echo('pod 路径设置成功, 为', argv.pod)
  }

  fs.writeFileSync('.easy_pod_config.json', JSON.stringify(config))

  if (! config.pod) {
    shell.echo('pod 路径为空')
    exec('ep --help')
    return false
  }

  if (! config.workspace) {
    shell.echo('workspace 路径为空')
    exec('ep --help')
    return false
  }

  if (argv._.length == 0 && (argv.w || argv.p)) {
    return false
  }
  return true
}

function createPodfileLocal() {

  shell.cd(config.workspace)
  exec("echo 'def use (name)' > podfile.local")
  exec("echo '  pod name, :path => \"" + config.pod + "\" + name' >> podfile.local")
  exec("echo 'end' >> podfile.local")
  exec("echo '' >> podfile.local")

  argv._.forEach(function(pod) {
    exec("echo 'use \"" + pod + "\"' >> podfile.local")
  })
}

function updatePod() {

  var updateParams = ['update']
  if (! argv.update) {
      updateParams.push('--no-repo-update')
  }

  exec('env PODFILE_TYPE=DEV')
  // 使用 spawn 才可以继承父进程的 stdio 才能有颜色
  var update = spawn('pod', updateParams, {
    stdio: 'inherit',
  })
  exec("open *.xcworkspace")
}






















