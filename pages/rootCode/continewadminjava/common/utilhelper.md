# common/util/helper
## LoginHelper.java
```java
public class LoginHelper {

    private LoginHelper() {
    }

    /**
     * 用户登录并缓存用户信息
     *
     * @param loginUser 登录用户信息
     * @return 令牌
     */
    public static String login(LoginUser loginUser) {
        // 记录登录信息
        HttpServletRequest request = SpringWebUtils.getRequest();
        loginUser.setIp(JakartaServletUtil.getClientIP(request));
        loginUser.setAddress(ExceptionUtils.exToNull(() -> IpUtils.getIpv4Address(loginUser.getIp())));
        loginUser.setBrowser(ServletUtils.getBrowser(request));
        loginUser.setLoginTime(LocalDateTime.now());
        loginUser.setOs(StrUtil.subBefore(ServletUtils.getOs(request), " or", false));
        // 登录并缓存用户信息
        StpUtil.login(loginUser.getId());
        SaHolder.getStorage().set(CacheConstants.LOGIN_USER_KEY, loginUser);
        String tokenValue = StpUtil.getTokenValue();
        loginUser.setToken(tokenValue);
        StpUtil.getTokenSession().set(CacheConstants.LOGIN_USER_KEY, loginUser);
        return tokenValue;
    }

    /**
     * 更新登录用户信息
     *
     * @param loginUser
     *                  登录用户信息
     * @param token     令牌
     */
    public static void updateLoginUser(LoginUser loginUser, String token) {
        SaHolder.getStorage().delete(CacheConstants.LOGIN_USER_KEY);
        StpUtil.getTokenSessionByToken(token).set(CacheConstants.LOGIN_USER_KEY, loginUser);
    }

    /**
     * 获取登录用户信息
     *
     * @return 登录用户信息
     * @throws NotLoginException 未登录异常
     */
    public static LoginUser getLoginUser() throws NotLoginException {
        StpUtil.checkLogin();
        LoginUser loginUser = (LoginUser)SaHolder.getStorage().get(CacheConstants.LOGIN_USER_KEY);
        if (null != loginUser) {
            return loginUser;
        }
        SaSession tokenSession = StpUtil.getTokenSession();
        loginUser = (LoginUser)tokenSession.get(CacheConstants.LOGIN_USER_KEY);
        SaHolder.getStorage().set(CacheConstants.LOGIN_USER_KEY, loginUser);
        return loginUser;
    }

    /**
     * 根据 Token 获取登录用户信息
     *
     * @param token 用户 Token
     * @return 登录用户信息
     */
    public static LoginUser getLoginUser(String token) {
        SaSession tokenSession = StpUtil.getStpLogic().getTokenSessionByToken(token, false);
        if (null == tokenSession) {
            return null;
        }
        return (LoginUser)tokenSession.get(CacheConstants.LOGIN_USER_KEY);
    }

    /**
     * 获取登录用户 ID
     *
     * @return 登录用户 ID
     */
    public static Long getUserId() {
        return getLoginUser().getId();
    }

    /**
     * 获取登录用户名
     *
     * @return 登录用户名
     */
    public static String getUsername() {
        return getLoginUser().getUsername();
    }

    /**
     * 获取登录用户昵称
     *
     * @return 登录用户昵称
     */
    public static String getNickname() {
        return getNickname(getUserId());
    }

    /**
     * 获取登录用户昵称
     *
     * @param userId 登录用户 ID
     * @return 登录用户昵称
     */
    public static String getNickname(Long userId) {
        return ExceptionUtils.exToNull(() -> SpringUtil.getBean(CommonUserService.class).getNicknameById(userId));
    }
}
```

## 代码逐步分解和详细解释
#### 1. 类定义
```java
public class LoginHelper {
    private LoginHelper() {
    }
}
```



+ `LoginHelper` 是一个工具类，使用私有构造函数阻止<font style="color:#DF2A3F;">实例化</font>，表明该类提供静态方法，而不需要创建对象。

#### 2. 登录方法
```java
public static String login(LoginUser loginUser) {
    // 记录登录信息
    HttpServletRequest request = SpringWebUtils.getRequest();
    loginUser.setIp(JakartaServletUtil.getClientIP(request));
    loginUser.setAddress(ExceptionUtils.exToNull(() -> IpUtils.getIpv4Address(loginUser.getIp())));
    loginUser.setBrowser(ServletUtils.getBrowser(request));
    loginUser.setLoginTime(LocalDateTime.now());
    loginUser.setOs(StrUtil.subBefore(ServletUtils.getOs(request), " or", false));
    
    // 登录并缓存用户信息
    StpUtil.login(loginUser.getId());
    SaHolder.getStorage().set(CacheConstants.LOGIN_USER_KEY, loginUser);
    String tokenValue = StpUtil.getTokenValue();
    loginUser.setToken(tokenValue);
    StpUtil.getTokenSession().set(CacheConstants.LOGIN_USER_KEY, loginUser);
    return tokenValue;
}
```



+ 该方法用于用户登录并缓存用户信息。
+ 通过 `HttpServletRequest` 获取请求信息，填写 `loginUser` 的 IP 地址、地址、浏览器、登录时间和操作系统等信息。
+ 使用 `StpUtil.login` 进行登录操作，并将 `loginUser` 信息存入 `SaHolder` 的存储中。
+ 生成并返回登录令牌。

#### 3. 更新用户信息
```java
public static void updateLoginUser(LoginUser loginUser, String token) {
    SaHolder.getStorage().delete(CacheConstants.LOGIN_USER_KEY);
    StpUtil.getTokenSessionByToken(token).set(CacheConstants.LOGIN_USER_KEY, loginUser);
}
```



+ 此方法用于更新已登录用户的信息。
+ 它先删除存储中的旧用户信息，然后将新的 `loginUser` 信息以令牌为索引存入。

#### 4. 获取当前登录用户信息
```java
public static LoginUser getLoginUser() throws NotLoginException {
    StpUtil.checkLogin();
    LoginUser loginUser = (LoginUser)SaHolder.getStorage().get(CacheConstants.LOGIN_USER_KEY);
    if (null != loginUser) {
        return loginUser;
    }
    SaSession tokenSession = StpUtil.getTokenSession();
    loginUser = (LoginUser)tokenSession.get(CacheConstants.LOGIN_USER_KEY);
    SaHolder.getStorage().set(CacheConstants.LOGIN_USER_KEY, loginUser);
    return loginUser;
}
```



+ 此方法获取当前登录用户的信息。
+ 首先检查用户是否已登录，如果未登录则抛出 `NotLoginException` 异常。
+ 试图从缓存中获取用户信息，如果未找到，则从令牌会话中获取并保存到缓存中。

#### 5. 根据 Token 获取用户信息
```java
public static LoginUser getLoginUser(String token) {
    SaSession tokenSession = StpUtil.getStpLogic().getTokenSessionByToken(token, false);
    if (null == tokenSession) {
        return null;
    }
    return (LoginUser)tokenSession.get(CacheConstants.LOGIN_USER_KEY);
}
```



+ 检查 Token 是否有效，若有效则返回相应的用户信息。

#### 6. 获取用户 ID 和用户名
```java
public static Long getUserId() {
    return getLoginUser().getId();
}

public static String getUsername() {
    return getLoginUser().getUsername();
}
```



+ `getUserId` 方法返回当前登录用户的 ID。
+ `getUsername` 方法返回当前登录用户的用户名。

#### 7. 获取用户昵称
```java
public static String getNickname() {
    return getNickname(getUserId());
}

public static String getNickname(Long userId) {
    return ExceptionUtils.exToNull(() -> SpringUtil.getBean(CommonUserService.class).getNicknameById(userId));
}
```



+ `getNickname` 方法首先调用 `getUserId` 来获取当前用户的昵称。
+ 第二个重载 `getNickname` 方法根据用户 ID 从服务中获取相应的昵称，并处理可能的异常。

#### 代码总结
`LoginHelper` 类提供了一系列静态方法，用于处理用户的登录、信息更新以及获取用户信息的功能。主要功能包括：

+ 登录并缓存用户信息。
+ 更新已登录用户的信息。
+ 获取当前登录用户的详细信息。
+ 根据 Token 获取用户信息。
+ 提供获取当前登录用户 ID、用户名和昵称的方法。

该类通过与 `SaToken` 和 `Hutool` 等库的集成，为应用程序提供了简洁而高效的用户认证和信息管理解决方案。
