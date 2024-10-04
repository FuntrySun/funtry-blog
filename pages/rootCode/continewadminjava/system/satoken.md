# /saToken
## LoginPasswordProperties.java——密码配置属性
```java
@Data
@Component
@ConfigurationProperties(prefix = "auth.password")
public class LoginPasswordProperties {

    /**
     * 排除（放行）路径配置
     */
    private String[] excludes = new String[0];
}
```

## SaTokenConfiguration.java——saToken配置
```java
@Configuration
@RequiredArgsConstructor
public class SaTokenConfiguration {

    private final SaTokenExtensionProperties properties;
    private final LoginPasswordProperties loginPasswordProperties;

    /**
     * Sa-Token 权限认证配置
     */
    @Bean
    public StpInterface stpInterface() {
        return new SaTokenPermissionImpl();
    }

    /**
     * SaToken 拦截器配置
     */
    @Bean
    public SaInterceptor saInterceptor() {
        return new SaInterceptor(handle -> SaRouter.match(StringConstants.PATH_PATTERN)
                                 .notMatch(properties.getSecurity().getExcludes())
                                 .check(r -> {
                                     LoginUser loginUser = LoginHelper.getLoginUser();
                                     if (SaRouter.isMatchCurrURI(loginPasswordProperties.getExcludes())) {
                                         return;
                                     }
                                     CheckUtils.throwIf(loginUser.isPasswordExpired(), "密码已过期，请修改密码");
                                 }));
    }
}
```

这段代码是一个Spring配置类，主要用于配置Sa-Token的权限认证和拦截器。下面逐步分解并详细解释每个部分的功能：

### 逐步分解
1. **类注解**：

```java
@Configuration
@RequiredArgsConstructor
```

- `@Configuration`：标识该类是一个Spring配置类，里面的方法会被Spring容器管理，并用于创建Spring Bean。
- `@RequiredArgsConstructor`：这会为类中的所有`final`字段生成一个构造方法，所有的`final`字段都会在构造时被注入，从而简化了手动构造和注入的过程。
2. **字段定义**：

```java
private final SaTokenExtensionProperties properties;
private final LoginPasswordProperties loginPasswordProperties;
```

- `properties`：用于配置Sa-Token的扩展属性。
- `loginPasswordProperties`：用于处理登录和密码相关的配置。
3. **Bean配置 - 权限认证**：

```java
@Bean
public StpInterface stpInterface() {
    return new SaTokenPermissionImpl();
}
```

- `@Bean`：表明该方法将返回一个Spring管理的Bean。
- `stpInterface()`：该方法返回一个实现权限认证的`StpInterface`接口的实例`SaTokenPermissionImpl`。这个接口通常用于定义用户的权限校验逻辑。
4. **Bean配置 - 拦截器**：

```java
@Bean
public SaInterceptor saInterceptor() {
    return new SaInterceptor(handle -> SaRouter.match(StringConstants.PATH_PATTERN)
        .notMatch(properties.getSecurity().getExcludes())
        .check(r -> {
            LoginUser loginUser = LoginHelper.getLoginUser();
            if (SaRouter.isMatchCurrURI(loginPasswordProperties.getExcludes())) {
                return;
            }
            CheckUtils.throwIf(loginUser.isPasswordExpired(), "密码已过期，请修改密码");
        }));
}
```

- `saInterceptor()`：该方法返回一个`SaInterceptor`的实例，用于处理请求的拦截和权限验证。
- `SaRouter.match(StringConstants.PATH_PATTERN)`：用于匹配请求路径是否符合定义的模式。
- `notMatch(properties.getSecurity().getExcludes())`：定义不需要进行拦截的路径。
- `check(r -> {...})`：检查用户的权限和状态。
- `LoginUser loginUser = LoginHelper.getLoginUser();`：获取当前登录的用户信息。
- `if (SaRouter.isMatchCurrURI(loginPasswordProperties.getExcludes())) { return; }`：如果当前URI匹配排除列表，则跳过检查。
- `CheckUtils.throwIf(loginUser.isPasswordExpired(), "密码已过期，请修改密码");`：检查用户的密码是否过期，如果过期则抛出异常，提示用户修改密码。

### 总结
这段代码的主要功能是配置Sa-Token的权限认证和拦截器。在权限认证方面，它定义了一个`StpInterface`的实现，用于处理用户的权限验证。在拦截器方面，它通过自定义的拦截器对请求进行拦截，检查用户的登录状态和密码是否过期，确保只有满足条件的请求才能继续往下执行。这样可以提高系统的安全性，确保用户在访问系统资源时具备有效的权限。

#### SaTokenPermissionImpl.java——SaToken权限认证实现
```java
public class SaTokenPermissionImpl implements StpInterface {

    @Override
    public List<String> getPermissionList(Object loginId, String loginType) {
        LoginUser loginUser = LoginHelper.getLoginUser();
        return new ArrayList<>(loginUser.getPermissions());
    }

    @Override
    public List<String> getRoleList(Object loginId, String loginType) {
        LoginUser loginUser = LoginHelper.getLoginUser();
        return new ArrayList<>(loginUser.getRoleCodes());
    }
}
```

### 类声明
```java
public class SaTokenPermissionImpl implements StpInterface {
```

CopyInsert

+ `public class SaTokenPermissionImpl`：定义了一个公开的类 `SaTokenPermissionImpl`。
+ `implements StpInterface`：这个类实现了 `StpInterface` 接口，因此它需要提供该接口中所有方法的具体实现。

### 2. getPermissionList 方法
```java
@Override
public List<String> getPermissionList(Object loginId, String loginType) {
    LoginUser loginUser = LoginHelper.getLoginUser();
    return new ArrayList<>(loginUser.getPermissions());
}
```

CopyInsert

#### 方法功能
+ `@Override`：表示这个方法是对接口中定义的方法的重写。
+ `public List<String> getPermissionList(Object loginId, String loginType)`：该方法返回一个 `List<String>` 类型的权限列表。方法参数包括 `loginId`（用户登录ID）和 `loginType`（用户登录类型），但在方法内未使用这两个参数。

#### 方法实现
+ `LoginUser loginUser = LoginHelper.getLoginUser();`：通过 `LoginHelper` 类获取当前登录用户的信息，返回一个 `LoginUser` 对象。
+ `return new ArrayList<>(loginUser.getPermissions());`：调用 `loginUser` 上的 `getPermissions()` 方法获取这个用户的权限列表，并将其转换为 `ArrayList` 返回。这样做的目的是为了确保返回的列表是一个可修改的具体实现。

### 3. getRoleList 方法
```java
@Override
public List<String> getRoleList(Object loginId, String loginType) {
    LoginUser loginUser = LoginHelper.getLoginUser();
    return new ArrayList<>(loginUser.getRoleCodes());
}
```

CopyInsert

#### 方法功能
+ `@Override`：同样表示这个方法是对接口中定义的方法的重写。
+ `public List<String> getRoleList(Object loginId, String loginType)`：该方法返回一个 `List<String>` 类型的角色列表。

#### 方法实现
+ `LoginUser loginUser = LoginHelper.getLoginUser();`：同样地，通过 `LoginHelper` 获取当前登录的用户信息。
+ `return new ArrayList<>(loginUser.getRoleCodes());`：调用 `loginUser` 的 `getRoleCodes()` 方法以获得当前用户的角色代码，并将其转换为 `ArrayList` 返回。

### 代码总结
总体而言，`SaTokenPermissionImpl` 类实现了 `StpInterface` 接口，主要功能是根据当前登录用户的信息提供其权限和角色列表。具体而言：

+ `getPermissionList` 方法返回当前用户的权限列表。
+ `getRoleList` 方法返回当前用户的角色列表。 这两个方法通过 `LoginHelper` 获取当前用户的登录信息，从而实现对用户权限与角色的动态获取。这个实现可以在需要进行权限验证的系统中使用，以确定用户能够执行的操作和所拥有的角色。