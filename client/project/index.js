const fullStar = "★";
const emptyStar = "☆";

const commitFragment = `
fragment commitFragment on Repository {
  ref(qualifiedName: "master") {
    target {
      ... on Commit {
        history {
          totalCount
        }
      }
    }
  }
}
`;

let queryRepoList;

let mutationAddStar;

let mutationRemoveStar;

function gplRequest(query, variables, onSuccess) {
  var github_token = "044996d2845d6d496f8e3bd5dd32cd80e1b6bb04";

  $.post({
    url: "https://api.github.com/graphql",
    headers: {
      Authorization: `bearer ${github_token}`
    },
    contentType: 'application/json',
    data: JSON.stringify({
      query: query,
      variables: variables
    }),
    success: (response) => {
      console.log(response);
      onSuccess(response)
    },
    error: (error) => console.log(error)
  });

}

function starHandler(element) {
  // STAR OR UNSTAR REPO BASED ON ELEMENT STATE

}

$(window).ready(function() {
  // GET NAME AND REPOSITORIES FOR VIEWER
  gplRequest(
    `{
      viewer {
      name
      }
    }`, 
    {},
    (response) => {
      console.log('at window.ready(): ' + response.data.viewer.name);
      $('header h2').text(`Hello ${response.data.viewer.name}`)
    }
  );
});