const graphql = require('graphql');
const knex = require('../db');

const { rateBook } = require('./models');

const userType = new graphql.GraphQLObjectType({
    name: 'User',
    description: 'A user in the system',
    fields: () => {
        return {
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
            },
            booksRead: {
                type: graphql.GraphQLList(hasReadType),
                resolve(user) {
                    return knex('hasRead').where('userId', user.id);
                }
            },
            averageRating: {
                type: graphql.GraphQLFloat,
                async resolve(user) {
                    let query = await knex('hasRead')
                        .where('userId', user.id)
                        .avg('rating as avg_rating')
                        .first();

                    return query['avg_rating'];
                }
            }
        }
    }
});

const bookType = new graphql.GraphQLObjectType({
    name: 'Book',
    description: 'A book in the system',
    fields: () => {
        return {
            id: {
                type: graphql.GraphQLID,
                resolve(book) {
                    return book.id;
                }
            },
            title: {
                type: graphql.GraphQLString,
                resolve(book) {
                    return book.title;
                }
            },
            author: {
                type: graphql.GraphQLString,
                resolve(book) {
                    return book.author;
                }
            },
            isFiction: {
                type: graphql.GraphQLBoolean,
                resolve(book) {
                    return book.fiction;
                }
            },
            publishedYear: {
                type: graphql.GraphQLInt,
                resolve(book) {
                    return book.publishedYear;
                }
            },
            readBy: {
                type: graphql.GraphQLList(hasReadType),
                resolve(book) {
                    return knex('hasRead').where('bookId', book.id);
                }
            }
        }
    }
});

const hasReadType = new graphql.GraphQLObjectType({
    name: 'HasRead',
    fields: {
        book: {
            type: bookType,
            resolve(hasRead) {
                return knex('book').where('id', hasRead.bookId).first();
            }
        },
        rating: {
            type: graphql.GraphQLInt,
            resolve(hasRead) {
                return hasRead.rating;
            }
        },
        user: {
            type: userType,
            resolve(hasRead) {
                return knex('user').where('id', hasRead.userId).first();
            }
        }
    }
});

const paginationArgs = {
    first: {
        type: graphql.GraphQLInt,
        defaultValue: 10
    },
    offset: {
        type: graphql.GraphQLInt
    }
};

const queryType = new graphql.GraphQLObjectType({
    name: 'Query',
    fields: {
        users: {
            type: graphql.GraphQLList(userType),
            args: paginationArgs,
            resolve(root, args) {
                console.log(args);

                var query = knex('user');

                if (args.first) {
                    query = query.limit(args.first);
                }

                if (args.offset) {
                    query = query.offset(args.offset);
                }

                return query;
            }
        },
        user: {
            type: userType,
            args: {
                id: {
                    type: graphql.GraphQLNonNull(graphql.GraphQLInt)
                }
            },
            resolve(root, args) {
                console.log(args);

                var query = knex('user');

                if (args.id) {
                    query = query.where('id', args.id).first();
                }

                return query;
            }
        },        
        books: {
            type: graphql.GraphQLList(bookType),
            args: {
                fiction: {
                    type: graphql.GraphQLBoolean
                },
                ...paginationArgs
            },
            resolve(root, args) {
                console.log(args);
                var query = knex('book');

                if (args.fiction != null) {
                    query = query.where('fiction', args.fiction);
                }

                if (args.first) {
                    query = query.limit(args.first);
                }

                if (args.offset) {
                    query = query.offset(args.offset);
                }

                return query;
            }
        }
    }
});

const mutationType = new graphql.GraphQLObjectType({
    name: 'Mutation',
    fields: {
        // this is really the various mutation operations possible
        rateBook: {
            type: hasReadType, // return value type from the mutation
            description: 'Rate a book or update a rating',
            args: {
                user: {
                    type: graphql.GraphQLNonNull(graphql.GraphQLID)
                },
                book: {
                    type: graphql.GraphQLNonNull(graphql.GraphQLID)
                },
                rating: {
                    type: graphql.GraphQLInt
                }
            },
            resolve(source, args) {
                const userId = args.user;
                const bookId = args.book;
                const rating = args.rating;

                return rateBook(bookId, userId, rating);
            }
        }
    }
});

const schema = new graphql.GraphQLSchema({
    query: queryType,
    mutation: mutationType
});

module.exports = schema;