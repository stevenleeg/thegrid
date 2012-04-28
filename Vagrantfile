Vagrant::Config.run do |config|
  config.vm.box = "squeeze32"
  config.vm.box_url = "http://mathie-vagrant-boxes.s3.amazonaws.com/debian_squeeze_32.box"
  config.vm.provision :puppet

  config.vm.forward_port 8080, 8080
  config.vm.forward_port 6379, 6379 
end
