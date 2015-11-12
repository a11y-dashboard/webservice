plan(key:'WSREL',name:'Release Accessibility Dashboard Webservice to Micros (Docker)',
   description:'Create new a11y-dashboard-webservice docker image to deploy to Micros.') {
   project(key:'A11Y',name:'Accessibility at Atlassian')

   repository(name:'Accessibility Dashboard Webservice')

   label(name:'micros')

   label(name:'plan-templates')

   label(name:'release')

   notification(type:'Failed Builds and First Successful',
      recipient:'hipchat',apiKey:'${bamboo.atlassian.hipchat.apikey.password}',
      notify:'true',room:'Design Platform')

   stage(name:'Build Docker Image',description:'Create a docker image for release to Micros.') {
      job(key:'BUILD',name:'Build a Docker Image',description:'Run docker commands to create a new a11y-dashboard-webservice image.') {
         requirement(key:'elastic',condition:'equals',value:'true')

         requirement(key:'os',condition:'equals',value:'Linux')

         artifactDefinition(name:'service-descriptor',pattern:'service-descriptor.*',
            shared:'true')

         bitbucket_build_status_start_task()

         task(type:'checkout',description:'Checkout Accessibility Dashboard Webservice repository') {
            repository(name:'Accessibility Dashboard Webservice')

         }
         task(type:'script',description:'Run build script for service.',
            scriptBody:'''

if [ -f bin/build ]
then
    bin/build
fi

''',
            environmentVariables:'SBT_OPTS="-Xmx1024m" JAVA_HOME="${bamboo.capability.system.jdk.JDK 1.8}"')

         task(type:'custom',createTaskKey:'com.atlassian.bamboo.plugins.bamboo-docker-plugin:task.docker.cli',
            description:'build image',registryOption:'hub',
            serviceTimeout:'120',commandOption:'build',
            serviceUrlPattern:'http://localhost:${docker.port}',
            repository:'docker.atlassian.io/atlassian/a11y-dashboard-webservice',
            dockerfileOption:'existing')

         task(type:'custom',createTaskKey:'com.atlassian.bamboo.plugins.bamboo-docker-plugin:task.docker.cli',
            description:'push to registry',registryOption:'custom',
            serviceTimeout:'120',commandOption:'push',serviceUrlPattern:'http://localhost:${docker.port}',
            pushRepository:'docker.atlassian.io/atlassian/a11y-dashboard-webservice',
            dockerfileOption:'inline')

          bitbucket_build_status_register_success_task()

          bitbucket_build_status_query_success_task()

      }
   }
   dependencies(blockingStrategy:'blockIfUnbuildChanges')

   permissions() {
      anonymous(permissions:'read')

      loggedInUser(permissions:'read,write,build,clone,administration')

   }
}

deployment(name:'Deploy Accessibility Dashboard Webservice to Micros (Docker)',
   planKey:'A11Y-WSREL',description:'Deploy a11y-dashboard-webservice package to Micros environments.') {
   versioning(version:'release-6',autoIncrementNumber:'true')

   environment(name:'Domain Development (a11y-dashboard-webservice)',
      description:'Domain Development (a11y-dashboard-webservice) domain service environment') {
      trigger(type:'afterSuccessfulPlan',description:'On successfully pushing docker image to docker registry.')

      //For security reasons please consider moving the password variable to global variables.

      variable(key:'micros.token.password',override:'false',
         value:'<your password here>')

      task(type:'addRequirement',description:'Require a Linux build agent to run scripts') {
         requirement(key:'os',condition:'equals',value:'Linux')

      }
      task(type:'addRequirement',description:'Require Python') {
         requirement(key:'system.builder.command.Python',condition:'exists')

      }

      bitbucket_build_status_custom(type:'init',message:'Deploy: ddev: started')

      task(type:'artifactDownload',description:'Get service descriptor',
         planKey:'A11Y-WSREL') {
         artifact(name:'service-descriptor',localPath:'service')

      }
      task(type:'npm',description:'Install micros-cli',
         command:'install @atlassian/micros-cli --production',
         executable:'Node.js')

      task(type:'script',description:'Deploy to Micros environment.',
         scriptBody:'MICROS_TOKEN="$bamboo_micros_token_password" "$(npm bin)/micros" service:deploy "a11y-dashboard-webservice" -f service/service-descriptor.* -e "ddev" -v')

      task(type:'artifactDownload',description:'Get release record',
         planKey:'A11Y-WSREL') {
         artifact(name:'all artifacts',localPath:'service')
      }

      bitbucket_build_status_register_success_task()
      bitbucket_build_status_query_success_task_with_message(
        success_message:'Deploy: ddev: success',
        fail_message:'Deploy: ddev: failure')
   }
   environment(name:'Application Development (a11y-dashboard-webservice)',
      description:'Application Development (a11y-dashboard-webservice) domain service environment') {
      //For security reasons please consider moving the password variable to global variables.

      variable(key:'micros.token.password',override:'false',
         value:'<your password here>')

      notification(type:'Deployment Finished',recipient:'hipchat',
         apiKey:'${bamboo.atlassian.hipchat.apikey.password}',
         notify:'false',room:'Design Platform')

      task(type:'addRequirement',description:'Require a Linux build agent to run scripts') {
         requirement(key:'os',condition:'equals',value:'Linux')

      }
      task(type:'artifactDownload',description:'Get service descriptor',
         planKey:'A11Y-WSREL') {
         artifact(name:'service-descriptor',localPath:'service')

      }
      task(type:'npm',description:'Install micros-cli',
         command:'install @atlassian/micros-cli --production',
         executable:'Node.js')

      task(type:'script',description:'Deploy to Micros environment.',
         scriptBody:'MICROS_TOKEN="$bamboo_micros_token_password" "$(npm bin)/micros" service:deploy "a11y-dashboard-webservice" -f service/service-descriptor.* -e "adev" -v')

      task(type:'artifactDownload',description:'Get release record',
         planKey:'A11Y-WSREL') {
         artifact(name:'all artifacts',localPath:'service')

      }
   }
   environment(name:'Staging East (a11y-dashboard-webservice)',
      description:'Staging East (a11y-dashboard-webservice) domain service environment') {
      //For security reasons please consider moving the password variable to global variables.

      variable(key:'micros.token.password',override:'false',
         value:'<your password here>')

      notification(type:'Deployment Finished',recipient:'hipchat',
         apiKey:'${bamboo.atlassian.hipchat.apikey.password}',
         notify:'false',room:'Design Platform')

      task(type:'addRequirement',description:'Require a Linux build agent to run scripts') {
         requirement(key:'os',condition:'equals',value:'Linux')

      }
      task(type:'artifactDownload',description:'Get service descriptor',
         planKey:'A11Y-WSREL') {
         artifact(name:'service-descriptor',localPath:'service')

      }
      task(type:'npm',description:'Install micros-cli',
         command:'install @atlassian/micros-cli --production',
         executable:'Node.js')

      task(type:'script',description:'Deploy to Micros environment.',
         scriptBody:'MICROS_TOKEN="$bamboo_micros_token_password" "$(npm bin)/micros" service:deploy "a11y-dashboard-webservice" -f service/service-descriptor.* -e "stg-east" -v')

      task(type:'artifactDownload',description:'Get release record',
         planKey:'A11Y-WSREL') {
         artifact(name:'all artifacts',localPath:'service')

      }
   }
   environment(name:'Staging West (a11y-dashboard-webservice)',
      description:'Staging West (a11y-dashboard-webservice) domain service environment') {
      //For security reasons please consider moving the password variable to global variables.

      variable(key:'micros.token.password',override:'false',
         value:'<your password here>')

      notification(type:'Deployment Finished',recipient:'hipchat',
         apiKey:'${bamboo.atlassian.hipchat.apikey.password}',
         notify:'false',room:'Design Platform')

      task(type:'addRequirement',description:'Require a Linux build agent to run scripts') {
         requirement(key:'os',condition:'equals',value:'Linux')

      }
      task(type:'artifactDownload',description:'Get service descriptor',
         planKey:'A11Y-WSREL') {
         artifact(name:'service-descriptor',localPath:'service')

      }
      task(type:'npm',description:'Install micros-cli',
         command:'install @atlassian/micros-cli --production',
         executable:'Node.js')

      task(type:'script',description:'Deploy to Micros environment.',
         scriptBody:'MICROS_TOKEN="$bamboo_micros_token_password" "$(npm bin)/micros" service:deploy "a11y-dashboard-webservice" -f service/service-descriptor.* -e "stg-west" -v')

      task(type:'artifactDownload',description:'Get release record',
         planKey:'A11Y-WSREL') {
         artifact(name:'all artifacts',localPath:'service')

      }
   }
   environment(name:'Production East (a11y-dashboard-webservice)',
      description:'Production East (a11y-dashboard-webservice) domain service environment') {
      //For security reasons please consider moving the password variable to global variables.

      variable(key:'micros.token.password',override:'false',
         value:'<your password here>')

      notification(type:'Deployment Finished',recipient:'hipchat',
         apiKey:'${bamboo.atlassian.hipchat.apikey.password}',
         notify:'false',room:'Design Platform')

      task(type:'addRequirement',description:'Require a Linux build agent to run scripts') {
         requirement(key:'os',condition:'equals',value:'Linux')

      }
      task(type:'artifactDownload',description:'Get service descriptor',
         planKey:'A11Y-WSREL') {
         artifact(name:'service-descriptor',localPath:'service')

      }
      task(type:'npm',description:'Install micros-cli',
         command:'install @atlassian/micros-cli --production',
         executable:'Node.js')

      task(type:'script',description:'Deploy to Micros environment.',
         scriptBody:'MICROS_TOKEN="$bamboo_micros_token_password" "$(npm bin)/micros" service:deploy "a11y-dashboard-webservice" -f service/service-descriptor.* -e "prod-east" -v')

      task(type:'artifactDownload',description:'Get release record',
         planKey:'A11Y-WSREL') {
         artifact(name:'all artifacts',localPath:'service')

      }
   }
   environment(name:'Production West (a11y-dashboard-webservice)',
      description:'Production West (a11y-dashboard-webservice) domain service environment') {
      //For security reasons please consider moving the password variable to global variables.

      variable(key:'micros.token.password',override:'false',
         value:'<your password here>')

      notification(type:'Deployment Finished',recipient:'hipchat',
         apiKey:'${bamboo.atlassian.hipchat.apikey.password}',
         notify:'false',room:'Design Platform')

      task(type:'addRequirement',description:'Require a Linux build agent to run scripts') {
         requirement(key:'os',condition:'equals',value:'Linux')

      }
      task(type:'artifactDownload',description:'Get service descriptor',
         planKey:'A11Y-WSREL') {
         artifact(name:'service-descriptor',localPath:'service')

      }
      task(type:'npm',description:'Install micros-cli',
         command:'install @atlassian/micros-cli --production',
         executable:'Node.js')

      task(type:'script',description:'Deploy to Micros environment.',
         scriptBody:'MICROS_TOKEN="$bamboo_micros_token_password" "$(npm bin)/micros" service:deploy "a11y-dashboard-webservice" -f service/service-descriptor.* -e "prod-west" -v')

      task(type:'artifactDownload',description:'Get release record',
         planKey:'A11Y-WSREL') {
         artifact(name:'all artifacts',localPath:'service')

      }
   }
   permissions() {
      anonymous(permissions:'read')

      loggedInUser(permissions:'read,write,build,clone,administration')

   }
}
