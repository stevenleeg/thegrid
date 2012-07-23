thegrid
=========

## State of thegrid
Thegrid is currently being redone from scratch. The new version is coming along incredibly well, and I can say that it runs *significantly* better than what you see here. I've been putting a lot of effort into this new version and I think anyone who is interested in this game will really love what's to come. Unfortuntely this increased effort has made me begin to consider different ways of releasing the game. I'll elaborate more on this as the new version becomes closer to a playable product, so stay tuned. 

Needless to say this project will remain up on Github as a sort of classic version. You're welcome to do whatever you'd like with it, but if anyone would really like to help out I'd encourage you to contact me to help with the new project!

Also, if you're really interested in the game, I'd encourage you to follow @thegridsays on twitter. I'll only use it for occasional updates and it'd mean a lot to me if I could see people are actually interested in my work!

---

Thegrid is a multiplayer RTS game. Your goal is to defeat any other colonies on your grid by placing special tiles and collecting resources.

For updates on the development of the game follow [@thegridsays](http://twitter.com/thegridsays) on Twitter.

![Thegrid in action](http://i.imgur.com/lVJiw.png)

**Now with 100% more hexagons!**

## Features
It's kind of hard to sum up a game with a feature list, but I'll try anyways:

 * Realtime multiplayer gameplay
 * Customizable maps
 * Defeat others using infectors or destroyers
 * A developer who loves working on this, so feel free to suggest additions
 * Released under the [GNU GPL License](http://www.gnu.org/copyleft/gpl.html). Hooray open source!

## Running a server
Eventually I'll get a guide for getting a production server up (it's kind of complex and requires nginx, haproxy, and supervisord), but for now here's how you can setup an easy development server:

Firstly, get [vagrant](http://vagrantup.com/):

    gem install vagrant

Next, clone the repo, cd in, and start the virtual machine:

    git clone https://stevenleeg@github.com/stevenleeg/thegrid.git
    cd thegrid
    vagrant up

I'm assuming you don't have the custom vagrant box that I created, so after this you may have to sit back for a bit while it downloads a copy from the internet. 

**Unrelated stuff:** If you're interested, the box is a pretty vanilla arch32 installation that I made. It might be pretty useful for your own projects. Feel free to play around with it if you'd like.

Now that the VM is up and running, let's start the grid server:

    vagrant ssh
    -- wait for the VM's prompt to pop up --
    cd /vagrant
    sudo rc.d start redis
    python thegrid.py

And there you go! Navigate to `http://localhost:8080` and you'll have a perfectly functional copy of thegrid waiting for you to play and hack on!

## About the project
I've always been interested in new technologies and I originally created this project for a fun way to mess around with [tornado](http://tornadoweb.org) and websockets. After showing this to a few friends, all of them seemed to like the concepts of the game so I continued to develop it. I currently don't have the money to turn this into anything big, so I figured it'd be best to share my learning with the world and invite anyone who's interested to learn with me and help develop. 

If you know some python, javascript, HTML, css, or have any sort of design expertise please feel free to join in by forking the repo. I'd love to have others work on this project with me. If not, you can help just as much by playing and enjoying the game and spreading the word!
