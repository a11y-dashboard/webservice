plan(key:'ADWT',name:'Accessibility Dashboard Webservice Tests',
   description:'Tests for the a11y-dashboard-webservice') {
   project(key:'A11Y',name:'Accessibility at Atlassian')

   repository(name:'Accessibility Dashboard Webservice')

   label(name:'plan-templates')

   trigger(type:'polling',strategy:'periodically',frequency:'180') {
      repository(name:'Accessibility Dashboard Webservice')

   }
   stage(name:'Default Stage') {
      job(key:'JOB1',name:'Default Job') {
         artifactDefinition(name:'command.log',pattern:'command.log',shared:'false')

         task(type:'checkout',description:'Checkout atlassian/a11y-dashboard-webservice') {
            repository(name:'Accessibility Dashboard Webservice')

         }
         task(type:'script',description:'Free port 8080',
            scriptBody:'''

#!/bin/bash
PID=`lsof -i :$PORT|grep LISTEN|head -n1|tr -s \' \'|cut -d\' \' -f2`
if [ -z "$PID" ] ; then
    echo "No one is occupying $PORT"
else
    kill -9 $PID
    echo "Killed $PID occupying port $PORT"
fi
exit 0

''',
            environmentVariables:'PORT="8080"')

         task(type:'npm',description:'Install dependencies',
            command:'install',executable:'Node.js 4.2')

         task(type:'script',description:'Install docker-compose',
            scriptBody:'''

set -e
curl -L -sS https://github.com/docker/compose/releases/download/$DOCKER_COMPOSE_VERSION/docker-compose-`uname -s`-`uname -m` -o docker-compose
chmod u+x docker-compose

''',
            environmentVariables:'DOCKER_COMPOSE_VERSION="1.5.0"')

         task(type:'script',description:'Run composed docker service in background',
            scriptBody:'''

set -e

screen -S a11yws -d -m bash -c "./docker-compose stop && ./docker-compose rm -f && ./docker-compose up 2>&1|tee command.log"
function kill_a11yws {
    screen -X -S a11yws quit
}
trap kill_a11yws INT EXIT

npm install wait-on
`npm bin`/wait-on -t 300000 tcp:8080

''')

         task(type:'npm',description:'Run tests',command:'run bamboo',
            executable:'Node.js 4.2')

         task(type:'custom',createTaskKey:'com.atlassian.bamboo.plugins.bamboo-nodejs-plugin:task.reporter.mocha',
            description:'Parse tests',final:'true',testPattern:'mocha.json')

      }
   }
   dependencies(triggerForBranches:'true') {
      childPlan(planKey:'A11Y-WSREL')

   }
   permissions() {
      anonymous(permissions:'read')

      loggedInUser(permissions:'read,write,build,clone,administration')

   }
}
