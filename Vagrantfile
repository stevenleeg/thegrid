Vagrant::Config.run do |config|
  config.vm.box = "arch32"
  config.vm.box_url = "http://sirjtaa.com/files/arch32.box"
  config.vm.provision :puppet

  config.vm.forward_port 8080, 8080
  config.vm.forward_port 6379, 6379 
end
