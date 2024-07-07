# API Documentation

This is the API documentation for my personal website.

## Limit

Limit each IP Address

| Duration       | Limit         |
| -------------- | ------------- |
| **Daily**      | **Unlimited** |
| **Per minute** | 60 requests   |
| **Per second** | 3 requests    |

## Environtments

```env
NODE_ENV=development

MONGODB_URI=
DB_NAME=

SECRET_KEY=
COOKIE_SECRET_KEY=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## Database

This application uses mongoDB to store the data and automatically creates the collections. So you don't need to prepare the collection first. Put the mongodb URI and database name to `.env` file.

## Image processing

I use cloudinary to process the image data. So make sure you have a cloudinary account. Put the cloudinary environtments to `.env` file

## HTTP Response

All error responses are accompanied by a JSON Error response.
| HTTP Status | Description |
| -------------- | ------------- |
| **200** | The request was successful |
| **201** | The post request was successful |
| **400** | You've made an invalid request. Recheck documentation |
| **401** | Unauthorize user. Please login or sign up first. |
| **403** | Forbidden user. Please login or sign up first. |
| **404** | The resource was not found, responded with a `404` |
| **429** | You are being rate limited (specified in the error response) |
| **500** | Something didn't work. Try again later. |

## Error Response

```json
{
  "message": "...",
  "stack": "only in development server"
}
```

## Request/Response Spesifications

- [Auth](#auth)
  - [Sign up](#sign-up)
  - [Login](#login)
  - [Logout](#logout)
  - [Refresh token](#refresh-token)
  - [Change password](#change-password)
  - [Delete account](#delete-account)
- [User](#user)
  - [Get user](#get-user)
  - [Update user](#update-user)
  - [Update user avatar](#update-user-avatar)
- [End](#end)

## Auth

### Sign up

**POST** - `[url]/auth/signup`

json body:

```json
{
  "username": "...",
  "email": "...",
  "password": "..."
}
```

response:

```json
{
  "message": "...",
  "token": "...",
  "refreshToken": "...",
  "body": {...}
}
```

### Login

**POST** - `[url]/auth/login`

json body:

```json
{
  "username": "...",
  "password": "..."
}
```

response:

```json
{
  "message": "...",
  "token": "...",
  "refreshToken": "...",
  "body": {...}
}
```

### Logout

**DELETE** - `[url]/auth/logout`

response:

```json
{
  "message": "..."
}
```

### Refresh token

**POST** - `[url]/auth/refresh`

json body:

```json
{
  "refreshToken": "..."
}
```

response:

```json
{
  "message": "...",
  "token": "...",
  "body": {...}
}
```

### Change password

**PATCH** - `[url]/auth/changePassword/:uid`

json body:

```json
{
  "refreshToken": "..."
}
```

response:

```json
{
  "message": "...",
  "token": "...",
  "body": {...}
}
```

### Delete account

**DELETE** - `[url]/auth/:uid`

response:

```json
{
  "message": "..."
}
```

## User

### Get user

**GET** - `[url]/user/:uid`

response:

```json
{
  "message": "...",
  "body": {
    "_id": "...",
    "email": "...",
    "username": "...",
    "avatar": {
      "public_id": "...",
      "imgUrl": "..."
    },
    "role": "..."
  }
}
```

### Update user

**PATCH** - `[url]/user/:uid`

json body:

```json
{ "username": "..." }
```

response:

```json
{
  "message": "...",
  "body": {...}
}
```

### Update user avatar

**PATCH** - `[url]/user/picture/:uid`

form data:

| Name  | Fields                      |
| ----- | --------------------------- |
| image | `file` maximum size is 1 MB |

response:

```json
{
  "message": "...",
  "body": {...}
}
```

## End

I'm sorry. This is the end of documentation.
