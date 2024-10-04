# /controller/auth
## AuthController.java——认证Api
```java
@Log(module = "登录")
@Tag(name = "认证 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {

    private static final String CAPTCHA_EXPIRED = "验证码已失效";
    private static final String CAPTCHA_ERROR = "验证码错误";
    private final LoginService loginService;
    private final UserService userService;

    @SaIgnore
    @Operation(summary = "账号登录", description = "根据账号和密码进行登录认证")
    @PostMapping("/account")
    public LoginResp accountLogin(@Validated @RequestBody AccountLoginReq loginReq, HttpServletRequest request) {
        String captchaKey = CacheConstants.CAPTCHA_KEY_PREFIX + loginReq.getUuid();
        String captcha = RedisUtils.get(captchaKey);
        ValidationUtils.throwIfBlank(captcha, CAPTCHA_EXPIRED);
        RedisUtils.delete(captchaKey);
        ValidationUtils.throwIfNotEqualIgnoreCase(loginReq.getCaptcha(), captcha, CAPTCHA_ERROR);
        // 用户登录
        String rawPassword = ExceptionUtils.exToNull(() -> SecureUtils.decryptByRsaPrivateKey(loginReq.getPassword()));
        ValidationUtils.throwIfBlank(rawPassword, "密码解密失败");
        String token = loginService.accountLogin(loginReq.getUsername(), rawPassword, request);
        return LoginResp.builder().token(token).build();
    }

    @SaIgnore
    @Operation(summary = "手机号登录", description = "根据手机号和验证码进行登录认证")
    @PostMapping("/phone")
    public LoginResp phoneLogin(@Validated @RequestBody PhoneLoginReq loginReq) {
        String phone = loginReq.getPhone();
        String captchaKey = CacheConstants.CAPTCHA_KEY_PREFIX + phone;
        String captcha = RedisUtils.get(captchaKey);
        ValidationUtils.throwIfBlank(captcha, CAPTCHA_EXPIRED);
        ValidationUtils.throwIfNotEqualIgnoreCase(loginReq.getCaptcha(), captcha, CAPTCHA_ERROR);
        RedisUtils.delete(captchaKey);
        String token = loginService.phoneLogin(phone);
        return LoginResp.builder().token(token).build();
    }

    @SaIgnore
    @Operation(summary = "邮箱登录", description = "根据邮箱和验证码进行登录认证")
    @PostMapping("/email")
    public LoginResp emailLogin(@Validated @RequestBody EmailLoginReq loginReq) {
        String email = loginReq.getEmail();
        String captchaKey = CacheConstants.CAPTCHA_KEY_PREFIX + email;
        String captcha = RedisUtils.get(captchaKey);
        ValidationUtils.throwIfBlank(captcha, CAPTCHA_EXPIRED);
        ValidationUtils.throwIfNotEqualIgnoreCase(loginReq.getCaptcha(), captcha, CAPTCHA_ERROR);
        RedisUtils.delete(captchaKey);
        String token = loginService.emailLogin(email);
        return LoginResp.builder().token(token).build();
    }

    @Operation(summary = "用户退出", description = "注销用户的当前登录")
    @Parameter(name = "Authorization", description = "令牌", required = true, example = "Bearer xxxx-xxxx-xxxx-xxxx", in = ParameterIn.HEADER)
    @PostMapping("/logout")
    public Object logout() {
        Object loginId = StpUtil.getLoginId(-1L);
        StpUtil.logout();
        return loginId;
    }

    @Log(ignore = true)
    @Operation(summary = "获取用户信息", description = "获取登录用户信息")
    @GetMapping("/user/info")
    public UserInfoResp getUserInfo() {
        LoginUser loginUser = LoginHelper.getLoginUser();
        UserDetailResp userDetailResp = userService.get(loginUser.getId());
        UserInfoResp userInfoResp = BeanUtil.copyProperties(userDetailResp, UserInfoResp.class);
        userInfoResp.setPermissions(loginUser.getPermissions());
        userInfoResp.setRoles(loginUser.getRoleCodes());
        userInfoResp.setPwdExpired(loginUser.isPasswordExpired());
        return userInfoResp;
    }

    @Log(ignore = true)
    @Operation(summary = "获取路由信息", description = "获取登录用户的路由信息")
    @GetMapping("/route")
    public List<RouteResp> listRoute() {
        return loginService.buildRouteTree(LoginHelper.getUserId());
    }
}
```
## 解析
1. **类注解和声明**：
    - `@Log(module = "登录")`：用于记录日志，标识此模块为“登录”。
    - `@Tag(name = "认证 API")`：用于Swagger API文档生成，标记这个控制器为“认证 API”。
    - `@RestController`：表明该类是一个控制器，并且返回 JSON 或 XML 响应。
    - `@RequiredArgsConstructor`：自动生成构造函数，注入 `LoginService` 和 `UserService` 类型的依赖。
    - `@RequestMapping("/auth")`：定义请求的基础路径为 `/auth`。
2. **常量定义**：
    - `CAPTCHA_EXPIRED` 和 `CAPTCHA_ERROR`：用于存储验证码相关的错误信息。
3. **依赖注入**：
    - `private final LoginService loginService`：处理用户登录相关的服务。
    - `private final UserService userService`：处理用户信息相关的服务。
4. **账号登录方法**：

```java
@SaIgnore
@Operation(summary = "账号登录", description = "根据账号和密码进行登录认证")
@PostMapping("/account")
public LoginResp accountLogin(@Validated @RequestBody AccountLoginReq loginReq, HttpServletRequest request) {
    // 获取并验证验证码
    String captchaKey = CacheConstants.CAPTCHA_KEY_PREFIX + loginReq.getUuid();
    String captcha = RedisUtils.get(captchaKey);
    ValidationUtils.throwIfBlank(captcha, CAPTCHA_EXPIRED);
    RedisUtils.delete(captchaKey);
    ValidationUtils.throwIfNotEqualIgnoreCase(loginReq.getCaptcha(), captcha, CAPTCHA_ERROR);
    // 解密密码
    String rawPassword = ExceptionUtils.exToNull(() -> SecureUtils.decryptByRsaPrivateKey(loginReq.getPassword()));
    ValidationUtils.throwIfBlank(rawPassword, "密码解密失败");
    // 登录并返回token
    String token = loginService.accountLogin(loginReq.getUsername(), rawPassword, request);
    return LoginResp.builder().token(token).build();
}
```

- 该方法处理用户通过账号和密码登录的请求。首先会验证验证码，接着解密用户密码，然后通过 `loginService` 进行登录，最后返回一个包含 token 的响应。
5. **手机号登录方法**：

```java
@SaIgnore
@Operation(summary = "手机号登录", description = "根据手机号和验证码进行登录认证")
@PostMapping("/phone")
public LoginResp phoneLogin(@Validated @RequestBody PhoneLoginReq loginReq) {
    // 验证手机号验证码
    String phone = loginReq.getPhone();
    String captchaKey = CacheConstants.CAPTCHA_KEY_PREFIX + phone;
    String captcha = RedisUtils.get(captchaKey);
    ValidationUtils.throwIfBlank(captcha, CAPTCHA_EXPIRED);
    ValidationUtils.throwIfNotEqualIgnoreCase(loginReq.getCaptcha(), captcha, CAPTCHA_ERROR);
    RedisUtils.delete(captchaKey);
    // 登录并返回token
    String token = loginService.phoneLogin(phone);
    return LoginResp.builder().token(token).build();
}
```

- 类似于账号登录，手机号登录使用手机号和验证码进行用户身份验证，流程相似。
6. **邮箱登录方法**：

```java
@SaIgnore
@Operation(summary = "邮箱登录", description = "根据邮箱和验证码进行登录认证")
@PostMapping("/email")
public LoginResp emailLogin(@Validated @RequestBody EmailLoginReq loginReq) {
    // 验证邮箱验证码
    String email = loginReq.getEmail();
    String captchaKey = CacheConstants.CAPTCHA_KEY_PREFIX + email;
    String captcha = RedisUtils.get(captchaKey);
    ValidationUtils.throwIfBlank(captcha, CAPTCHA_EXPIRED);
    ValidationUtils.throwIfNotEqualIgnoreCase(loginReq.getCaptcha(), captcha, CAPTCHA_ERROR);
    RedisUtils.delete(captchaKey);
    // 登录并返回token
    String token = loginService.emailLogin(email);
    return LoginResp.builder().token(token).build();
}
```

- 邮箱登录的流程与手机号登录类似，通过邮箱和验证码进行身份验证。
7. **用户退出方法**：

```java
@Operation(summary = "用户退出", description = "注销用户的当前登录")
@PostMapping("/logout")
public Object logout() {
    Object loginId = StpUtil.getLoginId(-1L);
    StpUtil.logout();
    return loginId;
}
```

- 该方法用于用户的注销功能。调用 `StpUtil` 进行注销，并返回当前登录的用户 ID。
8. **获取用户信息**：

```java
@Log(ignore = true)
@Operation(summary = "获取用户信息", description = "获取登录用户信息")
@GetMapping("/user/info")
public UserInfoResp getUserInfo() {
    LoginUser loginUser = LoginHelper.getLoginUser();
    UserDetailResp userDetailResp = userService.get(loginUser.getId());
    UserInfoResp userInfoResp = BeanUtil.copyProperties(userDetailResp, UserInfoResp.class);
    userInfoResp.setPermissions(loginUser.getPermissions());
    userInfoResp.setRoles(loginUser.getRoleCodes());
    userInfoResp.setPwdExpired(loginUser.isPasswordExpired());
    return userInfoResp;
}
```

- 用于获取当前登录用户的详细信息，包括权限、角色等。
9. **获取路由信息**：

```java
@Log(ignore = true)
@Operation(summary = "获取路由信息", description = "获取登录用户的路由信息")
@GetMapping("/route")
public List<RouteResp> listRoute() {
    return loginService.buildRouteTree(LoginHelper.getUserId());
}
```

- 返回登录用户的路由信息，用于前端页面的路由管理。

## SocialAuthController.java——三方账号认证api
```java
@Log(module = "登录")
@Tag(name = "三方账号认证 API")
@SaIgnore
@RestController
@RequiredArgsConstructor
@RequestMapping("/oauth")
public class SocialAuthController {

    private final LoginService loginService;
    private final AuthRequestFactory authRequestFactory;

    @Operation(summary = "三方账号登录授权", description = "三方账号登录授权")
    @Parameter(name = "source", description = "来源", example = "gitee", in = ParameterIn.PATH)
    @GetMapping("/{source}")
    public SocialAuthAuthorizeResp authorize(@PathVariable String source) {
        AuthRequest authRequest = this.getAuthRequest(source);
        return SocialAuthAuthorizeResp.builder()
        .authorizeUrl(authRequest.authorize(AuthStateUtils.createState()))
        .build();
    }

    @Operation(summary = "三方账号登录", description = "三方账号登录")
    @Parameter(name = "source", description = "来源", example = "gitee", in = ParameterIn.PATH)
    @PostMapping("/{source}")
    public LoginResp login(@PathVariable String source, @RequestBody AuthCallback callback) {
        if (StpUtil.isLogin()) {
            StpUtil.logout();
        }
        AuthRequest authRequest = this.getAuthRequest(source);
        AuthResponse<AuthUser> response = authRequest.login(callback);
        ValidationUtils.throwIf(!response.ok(), response.getMsg());
        AuthUser authUser = response.getData();
        String token = loginService.socialLogin(authUser);
        return LoginResp.builder().token(token).build();
    }

    private AuthRequest getAuthRequest(String source) {
        try {
            return authRequestFactory.get(source);
        } catch (Exception e) {
            throw new BadRequestException("暂不支持 [%s] 平台账号登录".formatted(source));
        }
    }
}
```
## 解析

### 1. 注释与包声明
```java
@Log(module = "登录")
@Tag(name = "三方账号认证 API")
@SaIgnore
@RestController
@RequiredArgsConstructor
@RequestMapping("/oauth")
public class SocialAuthController {
```


+ `@Log(module = "登录")`：用于记录日志的注解，可以用于跟踪和监控登录模块的操作。
+ `@Tag(name = "三方账号认证 API")`：OpenAPI注解，定义API的标签，用于生成API文档。
+ `@SaIgnore`：可能用于跳过某些安全检查的注解。
+ `@RestController`：表明该类是一个控制器，返回的内容会被序列化为JSON。
+ `@RequiredArgsConstructor`：自动生成带有所有`final`字段的构造函数的注解，用于依赖注入。
+ `@RequestMapping("/oauth")`：定义该控制器处理以`/oauth`开头的请求。

### 2. 变量声明
```java
private final LoginService loginService;
private final AuthRequestFactory authRequestFactory;
```


+ `loginService`：处理用户登录逻辑的服务。
+ `authRequestFactory`：用于创建不同第三方认证请求的工厂类。

### 3. 授权方法
```java
@Operation(summary = "三方账号登录授权", description = "三方账号登录授权")
@Parameter(name = "source", description = "来源", example = "gitee", in = ParameterIn.PATH)
@GetMapping("/{source}")
public SocialAuthAuthorizeResp authorize(@PathVariable String source) {
    AuthRequest authRequest = this.getAuthRequest(source);
    return SocialAuthAuthorizeResp.builder()
        .authorizeUrl(authRequest.authorize(AuthStateUtils.createState()))
        .build();
}
```

+ `@Operation`和`@Parameter`：用于OpenAPI文档的描述。
+ `@GetMapping("/{source}")`：处理HTTP GET请求，可以传入第三方平台的标识（如“gitee”）。
+ `authorize`方法：根据来源获取授权请求，并返回一个包含授权URL的响应对象。
    - 调用`getAuthRequest(source)`获取对应的`AuthRequest`。
    - 使用`authRequest.authorize()`生成授权链接。

### 4. 登录方法
```java
@Operation(summary = "三方账号登录", description = "三方账号登录")
@Parameter(name = "source", description = "来源", example = "gitee", in = ParameterIn.PATH)
@PostMapping("/{source}")
public LoginResp login(@PathVariable String source, @RequestBody AuthCallback callback) {
    if (StpUtil.isLogin()) {
        StpUtil.logout();
    }
    AuthRequest authRequest = this.getAuthRequest(source);
    AuthResponse<AuthUser> response = authRequest.login(callback);
    ValidationUtils.throwIf(!response.ok(), response.getMsg());
    AuthUser authUser = response.getData();
    String token = loginService.socialLogin(authUser);
    return LoginResp.builder().token(token).build();
}
```

+ `@PostMapping("/{source}")`：处理HTTP POST请求。
+ `login`方法：处理第三方用户的登录逻辑。
    - 首先检查用户是否已经登录，如已登录，则调用`StpUtil.logout()`注销当前用户。
    - 请求第三方API进行登录，并使用`callback`参数（通常包含用户授权后的返回信息）。
    - 检查响应是否成功，如果不成功抛出异常。
    - 获取用户信息后，通过`loginService.socialLogin(authUser)`生成访问令牌，并返回该令牌。

### 5. 获取认证请求的方法
```java
private AuthRequest getAuthRequest(String source) {
    try {
        return authRequestFactory.get(source);
    } catch (Exception e) {
        throw new BadRequestException("暂不支持 [%s] 平台账号登录".formatted(source));
    }
}
```

CopyInsert

+ `getAuthRequest`方法：根据来源获取对应的`AuthRequest`。如果平台未支持，则抛出`BadRequestException`。