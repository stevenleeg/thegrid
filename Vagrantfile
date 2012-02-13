Vagrant::Config.run do |config|
  config.vm.box = "arch32"
  config.vm.provision :puppet

  config.vm.forward_port "web", 8080, 8080
end
