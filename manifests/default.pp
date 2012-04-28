#
# Update the system
#
exec { "backports":
  command => "/bin/echo 'deb http://backports.debian.org/debian-backports squeeze-backports main' >> /etc/apt/sources.list",
  user => root
}

exec { "update1":
  command => "/usr/bin/sudo /usr/bin/apt-get update",
  require => Exec['backports']
}

#
# General packages
#
package { "python":
  ensure => "present",
  provider => "apt",
  require => Exec['update1']
}

package { "python-pip":
  ensure => "present",
  require => Package['python'],
  provider => "apt",
}

package { "redis-server/squeeze-backports":
  ensure => present,
  provider => "apt",
  require => Exec['update1']
}

#
# Required python libraries
#
exec { "Install-Py-Libraries":
  command => "/usr/bin/sudo pip install -r /vagrant/requirements.txt",
  require => Package['python-pip']
}

exec { "Start redis":
  command => "/usr/bin/sudo service redis-server start",
  require => Package['redis-server/squeeze-backports']
}
