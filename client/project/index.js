const fullStar = "★";
const emptyStar = "☆";

const commitFragment = `
fragment commitFragment on Repository {
  commits: ref(qualifiedName: "master") {
    target {
      ... on Commit {
        history {
          totalCount
        }
      }
    }
  }
}`;

let queryRepoList = `
{ 
  viewer { 
    name
    repos: repositories (
        first: 10, 
        orderBy: {field: CREATED_AT, direction: DESC}) {
      totalCount
      nodes {
        id
        name        
        description
        viewerHasStarred
        issues {
          totalCount
        }
        ...commitFragment        
      }
    }
  }
}
` + commitFragment;

const mutationAddStar = `
mutation($id: ID!) {
  addStar(input: {starrableId: $id}) {
    clientMutationId
    starrable {
      id
      ... on Repository {
        name
        viewerHasStarred
      }
    }
  }
}`;

let mutationRemoveStar = `
mutation($id: ID!) {
  removeStar(input: {starrableId: $id}) {
    clientMutationId
    starrable {
      id
      ... on Repository {
        name
        viewerHasStarred
      }
    }
  }
}`;

function gqlRequest(query, variables, onSuccess) {
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
      if (response.errors) {
        console.error(response.errors);
      } else {
        console.log(response);
        onSuccess(response.data);
      }
    },
    error: (error) => console.log(error)
  });

}

function starHandler(element) {
  // STAR OR UNSTAR REPO BASED ON ELEMENT STATE
//  console.log(element);
 if ($(element).text() == emptyStar) {
   console.log('To be starred')
   gqlRequest(
     mutationAddStar,
     { id: element.id },
     data => {
      if (data.addStar.starrable.viewerHasStarred) {
        $(element).text(fullStar);
      }
     }
    );
 } 
 else {
  console.log('To be un-starred');
  gqlRequest(
    mutationRemoveStar,
    { id: element.id },
    data => {
      if (!data.removeStar.starrable.viewerHasStarred) {
        $(element).text(emptyStar);
      }
    }
   );  
 }
}

$(window).ready(function () {
  // GET NAME AND REPOSITORIES FOR VIEWER
  gqlRequest(queryRepoList,
    {},
    (data) => {
      const name = data.viewer.name;
      $('header h2').text(`Hello ${name}`);

      const repos = data.viewer.repos;
      if (repos.totalCount > 0) {
        $("ul.repos").empty();

        repos.nodes.forEach(node => {
          const star = node.viewerHasStarred? fullStar: emptyStar;
          const repoElement = `
          <div>
            <h3>
              ${node.name}
              <span id=${node.id} class="star" onClick="starHandler(this)">${star}</span>
            </h3>
            <p>${node.description? node.description : 'n/a'}</p>
            <p>${node.commits.target.history.totalCount} commits</p>
          </div>
        `;

          $("ul.repos").append(`<li>${repoElement}</li>`);
        });
      }
    }
  );
});