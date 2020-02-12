const graphql = require('graphql');

const userType = new graphql.GraphQLObjectType({
    name: 'User',
    description: 'A user in the system',
    fields: {
        id: {
            type: graphql.GraphQLID,
            resolve(user) {
                return user.id;
            }
        }
    }
});

const queryType = new graphql.GraphQLObjectType({
    name: 'Query',
    fields: {
        users: {
            type: graphql.GraphQLList(userType),
            resolve(root) {
                return [{id: 'abc'}];
            }
        }
    }
});

const schema = new graphql.GraphQLSchema({
    query: queryType
});

module.exports = schema;