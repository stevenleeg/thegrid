#
# General packages
#
package { "python2":
  ensure => "present",
  provider => "pacman"
}

package { "python2-pip":
  ensure => "present",
  require => Package['python2'],
  provider => "pacman"
}

package { "redis":
  ensure => present,
  provider => "pacman"
}

#
# Link execs
#
exec { "Link-python":
  command => "/usr/bin/sudo ln /usr/bin/python2 /usr/bin/python",
  creates => "/usr/bin/python",
  require => Package['python2']
}

exec { "Link-pip":
  command => "/usr/bin/sudo ln /usr/bin/pip2 /usr/bin/pip",
  creates => "/usr/bin/pip",
  require => Package['python2-pip']
}

#
# Required python libraries
#
exec { "Install-Py-Libraries":
  command => "/usr/bin/sudo pip install -r /vagrant/requirements.txt",
  require => Exec['Link-pip']
}
