# common/config/properties 
## CaptchaProperties.java——验证码配置属性
```java
@Data
@Component
@ConfigurationProperties(prefix = "captcha")
public class CaptchaProperties {

    /**
     * 图形验证码过期时间
     */
    @Value("${continew-starter.captcha.graphic.expirationInMinutes}")
    private long expirationInMinutes;

    /**
     * 邮箱验证码配置
     */
    private CaptchaMail mail;

    /**
     * 短信验证码配置
     */
    private CaptchaSms sms;

    /**
     * 邮箱验证码配置
     */
    @Data
    public static class CaptchaMail {
        /**
         * 内容长度
         */
        private int length;

        /**
         * 过期时间
         */
        private long expirationInMinutes;

        /**
         * 模板路径
         */
        private String templatePath;
    }

    /**
     * 短信验证码配置
     */
    @Data
    public static class CaptchaSms {
        /**
         * 内容长度
         */
        private int length;

        /**
         * 过期时间
         */
        private long expirationInMinutes;

        /**
         * 模板 ID
         */
        private String templateId;
    }
}
```

## RsaProperties.java——RSA配置属性
```java
public class RsaProperties {

    /**
     * 私钥
     */
    public static final String PRIVATE_KEY;
    public static final String PUBLIC_KEY;

    static {
        PRIVATE_KEY = SpringUtil.getProperty("continew-starter.security.crypto.private-key");
        PUBLIC_KEY = SpringUtil.getProperty("continew-starter.security.crypto.public-key");
    }

    private RsaProperties() {
    }
}
```

`RsaProperties` 类主要功能是提供一个统一的方式来获取 RSA 加密的私钥和公钥。它通过静态常量的形式暴露这两个关键属性，并确保它们在整个应用程序中保持不变。此外，通过静态初始化块，私钥和公钥的值是从外部配置（可能是在 Spring 的配置文件中）加载的，使得这些配置能够灵活地根据需求进行修改。由于私有构造函数的存在，该类不能被实例化，从而确保了只通过类本身来访问这些加密属性。

## WebSocketClientServiceImpl.java——当前登录用户 Provider
```java
@Component
public class WebSocketClientServiceImpl implements WebSocketClientService {

    @Override
    public String getClientId(ServletServerHttpRequest request) {
        HttpServletRequest servletRequest = request.getServletRequest();
        String token = servletRequest.getParameter("token");
        LoginUser loginUser = LoginHelper.getLoginUser(token);
        return loginUser.getToken();
    }
}
```
### 解析
1. **@Component 注解**:
    - `@Component` 是 Spring 框架中的一个注解，用于标识该类是一个 Spring 组件，通过自动扫描进行管理。它表明 `WebSocketClientServiceImpl` 类是一个可被 Spring 容器实例化的 Bean。
2. **类定义**:

```java
public class WebSocketClientServiceImpl implements WebSocketClientService {
```

- 该类名为 `WebSocketClientServiceImpl`，并且实现了 `WebSocketClientService` 接口。这意味着它需要提供接口中定义的方法的实现。
3. **方法重写**:

```java
@Override
public String getClientId(ServletServerHttpRequest request) {
```

- `@Override` 注解表示这个方法是在实现接口时重写的方法。该方法接受一个 `ServletServerHttpRequest` 类型的参数，并返回一个 `String` 类型的客户端 ID。
4. **获取 Servlet 请求**:

```java
HttpServletRequest servletRequest = request.getServletRequest();
```

- 这里通过调用 `request.getServletRequest()` 方法将 `ServletServerHttpRequest` 转换为标准的 `HttpServletRequest` 对象，以便使用请求中的参数。
5. **提取 Token**:

```java
String token = servletRequest.getParameter("token");
```

- 使用 `getParameter("token")` 方法从 HTTP 请求中提取名为 `token` 的参数。这个 Token 可能用于身份验证或标识当前用户。
6. **获取登录用户信息**:

```java
LoginUser loginUser = LoginHelper.getLoginUser(token);
```

- 调用 `LoginHelper.getLoginUser(token)` 方法，根据提取到的 Token 获取当前登录用户的信息。`LoginUser` 可能是一个包含用户详细信息的模型类。
7. **返回用户 Token**:

```java
return loginUser.getToken();
```

- 最后，返回 `loginUser` 对象中的 Token，此 Token 可能用于 WebSocket 连接的身份验证。

总结：

`WebSocketClientServiceImpl` 类的主要功能是从 WebSocket 请求的 HTTP 上下文中提取客户端的身份信息。它通过将 `ServletServerHttpRequest` 转换为 `HttpServletRequest`，获取请求中的 Token，然后通过 `LoginHelper` 类来查找当前用户的信息，最后返回该用户的 Token。这一过程对于实现基于 Token 的用户身份验证和管理 WebSocket 连接是非常重要的。