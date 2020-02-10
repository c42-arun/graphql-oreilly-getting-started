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

let queryRepoList = `
{ 
  viewer { 
    name
    repos: repositories (first: 10) {
      totalCount
      nodes {
        name
      }
    }
  }
}`;

let mutationAddStar;

let mutationRemoveStar;

function gplRequest(query, variables, onSuccess) {
  var github_token = "33c567a9027eab39a55fd0278e429f38dd9bc929";

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

$(window).ready(function () {
  // GET NAME AND REPOSITORIES FOR VIEWER
  gplRequest(queryRepoList,
    {},
    (response) => {
      const name = response.data.viewer.name;
      $('header h2').text(`Hello ${name}`);

      const repos = response.data.viewer.repos;
      if (repos.totalCount > 0) {
        $("ul.repos").empty();

        repos.nodes.forEach(node => {
          const repoElement = `
          <div>
            <h3>${node.name}</h3>
          </div>
        `;

          $("ul.repos").append(`<li>${repoElement}</li>`);
        });
      }
    }
  );
});