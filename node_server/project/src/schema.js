const graphql = require('graphql');
const knex = require('../db');

const userType = new graphql.GraphQLObjectType({
    name: 'User',
    description: 'A user in the system',
    fields: {
        id: {
            type: graphql.GraphQLID,
            resolve(user) {
                return user.id;
            }
        },
        username: {
            type: graphql.GraphQLString,
            resolve(user) {
                return user.username
            }
        },
        isAdmin: {
            type: graphql.GraphQLBoolean,
            resolve(user) {
                return user.role === 'admin';
            },
            description: 'Whether the user is god'
        }
    }
});

const queryType = new graphql.GraphQLObjectType({
    name: 'Query',
    fields: {
        users: {
            type: graphql.GraphQLList(userType),
            resolve(root) {
                return knex('user');
            }
        }
    }
});

const schema = new graphql.GraphQLSchema({
    query: queryType
});

module.exports = schema;