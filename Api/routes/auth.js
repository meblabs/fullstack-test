/**
 * @openapi
 * tags:
 *  name: Auth
 *  description: The api used to manage authentication and authorization
 */

/**
 *  @openapi
 *  components:
 *    definitions:
 *      AuthFields:
 *        Email:
 *          type: string
 *          format: email
 *          required: true
 *        Password:
 *          type: string
 *          format: password
 *        Name:
 *          type: string
 *        Lastname:
 *          type: string
 *        Fullname:
 *          type: string
 *        Lang:
 *          type: string
 *          minLength: 2
 *          maxLength: 2
 *          example: it
 *        Phone:
 *          type: string
 *          format: phone-number
 *          pattern: ^\+[0-9]{9,12}$
 */

/**
 *  @openapi
 *  components:
 *    tokens:
 *      accessToken:
 *        description: "Access Token: Token used to authenticate and authorizate in the api [HttpOnly]"
 *        type: string
 *        example: accessToken={JWT}; Path=/; Expires=Thu, 06 Oct 2022 08:28:25 GMT; HttpOnly; Secure; SameSite=Strict
 *      refreshToken:
 *        description: "Refresh Token: Token used to get a refreshed accessToken [HttpOnly]"
 *        type: string
 *        example: accessToken={JWT}; Path=/; Expires=Thu, 06 Oct 2022 08:28:25 GMT; HttpOnly; Secure; SameSite=Strict
 *      loginTokens:
 *        Set-Cookie:
 *          $ref: '#/components/tokens/accessToken'
 *        "\0Set-Cookie":
 *          $ref: '#/components/tokens/refreshToken'
 */

const express = require('express');
const {
  login,
  check,
  checkIfEmailExists,
  register,
  refreshToken,
  logout,
  forgotPassword,
  changePassword,
  restoreUser
} = require('../controllers/auth');
const { isAuth, isAuthRt, isAuthRtlogout, isAuthChangePassword } = require('../middlewares/isAuth');
const { validator } = require('../middlewares/validator');
const { resendActivationEmail } = require('../controllers/auth');

const router = express.Router();

/**
 * @openapi
 *
 *  /auth/login:
 *    post:
 *      summary: Login with email and password sets cookies to use the api
 *      tags: [Auth]
 *      security: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                email:
 *                  $ref: '#/components/definitions/AuthFields/Email'
 *                password:
 *                  $ref: '#/components/definitions/AuthFields/Password'
 *      responses:
 *        200:
 *          description: >
 *            The user logged in successfully. Three cookies are set: 'accessToken', 'refreshToken' and 'logged'
 *            You need to include accessToken in subsequent requests.
 *          headers:
 *            $ref: '#/components/tokens/loginTokens'
 *        401:
 *          $ref: '#/components/responses/Unauthorized'
 *        400:
 *          $ref: '#/components/responses/BadRequest'
 *        500:
 *          $ref: '#/components/responses/ServerError'
 */

router.post('/login', validator('login'), login);

router.get('/check', isAuth, check);

router.get('/email/:email?', validator({ params: 'checkEmail' }), checkIfEmailExists);

router.post('/resendActivationEmail', validator('checkEmail'), resendActivationEmail);

router.post('/register', validator('register'), register);

router.get('/rt', isAuthRt, refreshToken);

router.get('/logout', isAuthRtlogout, logout);

router.post('/forgotPassword', forgotPassword);

router.post('/restoreUser', restoreUser);

router.patch(
  '/changePassword/:email/:token',
  validator({ body: 'changePassword', params: 'changePasswordParams' }),
  isAuthChangePassword,
  changePassword
);

module.exports = router;
