//This Allows to Fetch Inputs from the Workflow (when u use the [with] keyword) and Use Them in Variables
const CoreActions = require('@actions/core')
const GithubActions = require('@actions/github')

const { wait } = require('./wait')

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
  try {
    //Declare the Input Variables U Defined in the action.yml File
    const OwnerVar = CoreActions.getInput('owner', { required: true })
    const RepoVar = CoreActions.getInput('repo', { required: true })
    const PRNumb = CoreActions.getInput('pullreq_number', { required: true })
    const GithubToken = CoreActions.getInput('github_token', { required: true })

    // Initialize an Octokit Instance --> Javascript Lib that Allows The Call of REST APIs
    // Use the Octokit Documentation to Call Github Rest API Cmds
    const Octokit = new GithubActions.getOctokit(GithubToken)

    //Use Octokit to Call the Github API to List Pull Requests Files
    const PullReqData = await Octokit.rest.pulls.listFiles({
      owner: OwnerVar,
      repo: RepoVar,
      pull_number: PRNumb
    })

    //const PullReqData = PullReqsObj.data
    console.log('PullReqsObj', PullReqData)
    CoreActions.info(PullReqData)
    //Variable Carrying the Initial Data Before the Change in the Pull Request Being Applied
    const DiffData = {
      additions: 0,
      deletions: 0,
      changes: 0
    }

    console.log('Here We are before')
    //Variable with the Change Data Associated with the Pull Request

    for (let i = 0; i < PullReqData.data.length; i++) {
      DiffData.additions = DiffData.additions + PullReqData.data[i].additions
      DiffData.deletions = DiffData.deletions + PullReqData.data[i].deletions
      DiffData.changes = DiffData.changes + PullReqData.data[i].changes

      //Prints Normally Just don't Forget to Run npm run all before hand
      console.log('DiffData.additions', DiffData.additions)
      console.log('DiffData.deletions', DiffData.deletions)
      console.log('DiffData.changes', DiffData.changes)
    }

    // const FinalDiffData = PullReqData.data.reduce((PrvsValue, CurrentValue) => {
    //   PrvsValue.additions = PrvsValue.additions + CurrentValue.additions
    //   PrvsValue.deletions = PrvsValue.deletions + CurrentValue.deletions
    //   PrvsValue.changes = PrvsValue.changes + CurrentValue.changes
    //   console.log('PrvsValue.additions', PrvsValue.additions)
    //   console.log('PrvsValue.deletions', PrvsValue.deletions)
    //   console.log('PrvsValue.changes', PrvsValue.changes)
    // }, InitialDiffData)

    // Add A comment to the Pull Request with the FinalDiffData
    console.log('Here We are after')
    await Octokit.rest.issues.createComment({
      owner: OwnerVar,
      repo: RepoVar,
      issue_number: PRNumb,
      body: `Pull Request #${PRNumb} has been Updated with: \n
              - ${DiffData.changes} changes \n
              - ${DiffData.additions} additions \n
              - ${DiffData.deletions} deletions \n
          `
    })

    // A Loop to Create the Labels of the Extensions of the Files in the Pull Request
    for (const i of PullReqData.data) {
      //filname = readme.md
      //filename.split(".").pop() --> "md"
      const FileExtension = i.filename.split('.').pop()
      let label = ''
      switch (FileExtension) {
        case 'md':
          label = 'markdown'
          break

        case 'js':
          label = 'javascript'
          break

        case 'yml':
          label = 'yaml'
          break

        case 'yaml':
          label = 'yaml'
          break

        default:
          label = 'noextention'
      }
      await Octokit.rest.issues.addLabels({
        owner: OwnerVar,
        repo: RepoVar,
        issue_number: PRNumb,
        labels: [label]
      })
    }

    // const ms = CoreActions.getInput('milliseconds', { required: true })

    // Debug logs are only output if the `ACTIONS_STEP_DEBUG` secret is true
    // CoreActions.debug(`Waiting ${ms} milliseconds ...`)
    //

    // // Log the current timestamp, wait, then log the new timestamp
    // CoreActions.debug(new Date().toTimeString())
    // await wait(parseInt(ms, 10))
    // CoreActions.debug(new Date().toTimeString())

    //
    // // Set outputs for other workflow steps to use
    // CoreActions.setOutput('time', new Date().toTimeString())
  } catch (error) {
    // Fail the workflow run if an error occurs
    CoreActions.setFailed(error.message)
  }
}

module.exports = {
  run
}

//After Finishing the Code Run or CHANGING IT Always Run [npm run all] in terminal
