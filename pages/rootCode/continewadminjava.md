# ContinewAdminJava
::: info
在此对Continew-admin的作者及其团队成员表达由衷的感谢！！！
:::
## Continew-Admin-Common模块
### common/config/exception
#### GlobalExceptionHandler.java——全局异常处理
```java
@Slf4j
@Order(99)
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 拦截业务异常
     */
    @ExceptionHandler(BusinessException.class)
    public R handleBusinessException(BusinessException e, HttpServletRequest request) {
        log.error("[{}] {}", request.getMethod(), request.getRequestURI(), e);
        return R.fail(String.valueOf(HttpStatus.INTERNAL_SERVER_ERROR.value()), e.getMessage());
    }

    /**
     * 拦截自定义验证异常-错误请求
     */
    @ExceptionHandler(BadRequestException.class)
    public R handleBadRequestException(BadRequestException e, HttpServletRequest request) {
        log.error("[{}] {}", request.getMethod(), request.getRequestURI(), e);
        return R.fail(String.valueOf(HttpStatus.BAD_REQUEST.value()), e.getMessage());
    }

    /**
     * 拦截文件上传异常-超过上传大小限制
     */
    @ExceptionHandler(MultipartException.class)
    public R handleRequestTooBigException(MultipartException e, HttpServletRequest request) {
        log.error("[{}] {}", request.getMethod(), request.getRequestURI(), e);
        String msg = e.getMessage();
        R defaultFail = R.fail(String.valueOf(HttpStatus.BAD_REQUEST.value()), msg);
        if (CharSequenceUtil.isBlank(msg)) {
            return defaultFail;
        }
        String sizeLimit;
        Throwable cause = e.getCause();
        if (null != cause) {
            msg = msg.concat(cause.getMessage().toLowerCase());
        }
        if (msg.contains("size") && msg.contains("exceed")) {
            sizeLimit = CharSequenceUtil.subBetween(msg, "the maximum size ", " for");
        } else if (msg.contains("larger than")) {
            sizeLimit = CharSequenceUtil.subAfter(msg, "larger than ", true);
        } else {
            return defaultFail;
        }
        String errorMsg = "请上传小于 %sKB 的文件".formatted(NumberUtil.parseLong(sizeLimit) / 1024);
        return R.fail(String.valueOf(HttpStatus.BAD_REQUEST.value()), errorMsg);
    }
}
```

##### 分析：
```java
@Slf4j
@Order(99)
@RestControllerAdvice
public class GlobalExceptionHandler {
```

+ `@Slf4j` 注解自动生成日志记录的代码。
+ `@Order(99)` 用于定义此异常处理器的优先级。
+ `@RestControllerAdvice` 是一个组合注解，用于定义一个全局的异常处理器。
1. **异常处理方法**：
    - **业务异常处理**：

```java
@ExceptionHandler(BusinessException.class)
public R handleBusinessException(BusinessException e, HttpServletRequest request) {
    log.error("[{}] {}", request.getMethod(), request.getRequestURI(), e);
    return R.fail(String.valueOf(HttpStatus.INTERNAL_SERVER_ERROR.value()), e.getMessage());
}
```

        * 捕捉 `BusinessException`，记录错误信息，并返回包含错误信息的响应。
    - **错误请求处理**：

```java
@ExceptionHandler(BadRequestException.class)
public R handleBadRequestException(BadRequestException e, HttpServletRequest request) {
    log.error("[{}] {}", request.getMethod(), request.getRequestURI(), e);
    return R.fail(String.valueOf(HttpStatus.BAD_REQUEST.value()), e.getMessage());
}
```

        * 捕捉 `BadRequestException`，记录错误信息，并返回400错误响应。
    - **文件上传大小限制处理**：

```java
@ExceptionHandler(MultipartException.class)
public R handleRequestTooBigException(MultipartException e, HttpServletRequest request) {
    log.error("[{}] {}", request.getMethod(), request.getRequestURI(), e);
    String msg = e.getMessage();
    R defaultFail = R.fail(String.valueOf(HttpStatus.BAD_REQUEST.value()), msg);
    ...
    return R.fail(String.valueOf(HttpStatus.BAD_REQUEST.value()), errorMsg);
}
```

        * 捕捉 `MultipartException`，即文件上传时超过大小限制。通过分析异常信息构建友好的提示信息，然后返回400错误响应，提示用户“请上传小于XXKB的文件”。

#### GlobalSaTokenExceptionHandler.java——satoken全局异常处理
```java
/**
 * 全局 SaToken 异常处理器
 */
@Slf4j
@Order(99)
@RestControllerAdvice
public class GlobalSaTokenExceptionHandler {

    /**
     * 认证异常-登录认证
     */
    @ExceptionHandler(NotLoginException.class)
    public R handleNotLoginException(NotLoginException e, HttpServletRequest request) {
        log.error("[{}] {}", request.getMethod(), request.getRequestURI(), e);
        String errorMsg = switch (e.getType()) {
            case NotLoginException.KICK_OUT -> "您已被踢下线";
            case NotLoginException.BE_REPLACED_MESSAGE -> "您已被顶下线";
            default -> "您的登录状态已过期，请重新登录";
        };
        return R.fail(String.valueOf(HttpStatus.UNAUTHORIZED.value()), errorMsg);
    }

    /**
     * 认证异常-权限认证
     */
    @ExceptionHandler(NotPermissionException.class)
    public R handleNotPermissionException(NotPermissionException e, HttpServletRequest request) {
        log.error("[{}] {}", request.getMethod(), request.getRequestURI(), e);
        return R.fail(String.valueOf(HttpStatus.FORBIDDEN.value()), "没有访问权限，请联系管理员授权");
    }

    /**
     * 认证异常-角色认证
     */
    @ExceptionHandler(NotRoleException.class)
    public R handleNotRoleException(NotRoleException e, HttpServletRequest request) {
        log.error("[{}] {}", request.getMethod(), request.getRequestURI(), e);
        return R.fail(String.valueOf(HttpStatus.FORBIDDEN.value()), "没有访问权限，请联系管理员授权");
    }
}
```

##### 分析：
1. **注解**:

```java
@Slf4j
@Order(99)
@RestControllerAdvice
```

    - `@Slf4j`用于日志记录。
    - `@Order(99)`定义了异常处理器的优先级，值越小优先级越高。
    - `@RestControllerAdvice`是一个组合注解，表示该类是一个控制器增强（Advice），可以用来捕获和处理控制器抛出的异常。
2. **日志和异常处理方法**:
    - 每个方法均使用`@ExceptionHandler`注解来处理特定类型的异常。
    - 例如，对`NotLoginException`的处理方法如下：

```java
@ExceptionHandler(NotLoginException.class)
public R handleNotLoginException(NotLoginException e, HttpServletRequest request) {
    log.error("[{}] {}", request.getMethod(), request.getRequestURI(), e);
    ...
}
```

    - `handleNotLoginException`方法会在捕获到`NotLoginException`时被调用。
3. **异常处理逻辑**:
    - 在`handleNotLoginException`方法中，
        * 使用`log.error`记录请求的方法（如GET、POST）和请求路径（URI）以及异常信息。
        * 通过`switch`语句判断异常类型，设置相应的错误信息。
        * 最后返回一个包装好的失败响应，包含HTTP状态码和错误信息。
    - 其他两个处理方法`handleNotPermissionException`和`handleNotRoleException`的处理逻辑类似，但它们返回的错误信息一致，均提示没有访问权限。

#### switch示例
```java
int day = 3; // 假设1表示星期一，2表示星期二，依此类推

String dayName; // 用于存储星期几的名称

switch (day) {
    case 1:
        dayName = "星期一";
        break;
    case 2:
        dayName = "星期二";
        break;
    case 3:
        dayName = "星期三";
        break;
    case 4:
        dayName = "星期四";
        break;
    case 5:
        dayName = "星期五";
        break;
    case 6:
        dayName = "星期六";
        break;
    case 7:
        dayName = "星期日";
        break;
    default:
        dayName = "无效的输入"; // 处理不在1到7范围内的输入
        break;
}

System.out.println("今天是: " + dayName);



今天是: 星期三

```

### common/config/mybatis
#### BCryptEncryptor.java——加/解密处理器（不可逆）
```java
/**
 * BCrypt 加/解密处理器（不可逆）
 */
public class BCryptEncryptor implements IEncryptor {

    private final PasswordEncoder passwordEncoder;

    public BCryptEncryptor(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public String encrypt(String plaintext, String password, String publicKey) throws Exception {
        return passwordEncoder.encode(plaintext);
    }

    @Override
    public String decrypt(String ciphertext, String password, String privateKey) throws Exception {
        return ciphertext;
    }
}
```

1. **类定义**

```java
public class BCryptEncryptor implements IEncryptor {
```

    - 定义了 `BCryptEncryptor` 类，并实现了 `IEncryptor` 接口，表示这个类需要实现接口中定义的方法。
2. **成员变量**

```java
private final PasswordEncoder passwordEncoder;
```

    - 定义了一个 `passwordEncoder` 变量，用于执行实际的加密操作，该变量在实例化时被初始化。
3. **构造函数**

```java
public BCryptEncryptor(PasswordEncoder passwordEncoder) {
    this.passwordEncoder = passwordEncoder;
}
```

    - 构造函数接收一个 `PasswordEncoder` 的实例并初始化 `passwordEncoder`。这允许外部在创建 `BCryptEncryptor` 对象时提供具体的加密实现。
4. **加密方法**

```java
@Override
public String encrypt(String plaintext, String password, String publicKey) throws Exception {
    return passwordEncoder.encode(plaintext);
}
```

    - 此方法实现了 `IEncryptor` 接口中的加密功能。它接收明文字符串 `plaintext`，并使用 `passwordEncoder` 来进行加密操作。此方法返回加密后的字符串。
5. **解密方法**

```java
@Override
public String decrypt(String ciphertext, String password, String privateKey) throws Exception {
    return ciphertext;
}
```

    - 此方法同样实现了 `IEncryptor` 接口中的解密功能。由于 BCrypt 是一种不可逆的加密算法，因此该方法直接返回输入的密文 `ciphertext`，表示无法解密回原文。

#### DataPermissionMapper.java——数据权限 Mapper 基类
```java
public interface DataPermissionMapper<T> extends BaseMapper<T> {

    /**
     * 根据 entity 条件，查询全部记录
     *
     * @param queryWrapper 实体对象封装操作类（可以为 null）
     * @return 全部记录
     */
    @Override
    @DataPermission
    List<T> selectList(@Param(Constants.WRAPPER) Wrapper<T> queryWrapper);

    /**
     * 根据 entity 条件，查询全部记录（并翻页）
     *
     * @param page         分页查询条件
     * @param queryWrapper 实体对象封装操作类（可以为 null）
     * @return 全部记录（并翻页）
     */
    @Override
    @DataPermission
    List<T> selectList(IPage<T> page, @Param(Constants.WRAPPER) Wrapper<T> queryWrapper);
}
```

1. **接口声明**：

```java
public interface DataPermissionMapper<T> extends BaseMapper<T> {
```

声明了一个公共接口 `DataPermissionMapper`，它继承了 `BaseMapper<T>`，意味着它将包含基础的数据库操作方法。

2. **方法定义（查询所有记录）**：

```java
@Override
@DataPermission
List<T> selectList(@Param(Constants.WRAPPER) Wrapper<T> queryWrapper);
```

    - 使用 `@Override` 注解表示重写了 `BaseMapper` 中的方法。
    - 使用 `@DataPermission` 注解，表明该方法对于数据权限的控制。
    - 方法参数 `queryWrapper` 用于封装查询条件，返回类型为 `List<T>`，表示满足条件的所有记录。
3. **方法定义（分页查询）**：

```java
@Override
@DataPermission
List<T> selectList(IPage<T> page, @Param(Constants.WRAPPER) Wrapper<T> queryWrapper);
```

    - 同样使用 `@Override` 和 `@DataPermission` 注解。
    - `IPage<T> page` 参数用于定义分页查询条件。
    - `queryWrapper` 用于封装查询条件，返回满足条件的记录（带分页）。

#### DefaultDataPermissionUserContextProvider.java——数据权限用户上下文提供者
```java
public class DefaultDataPermissionUserContextProvider implements DataPermissionUserContextProvider {

    @Override
    public boolean isFilter() {
        LoginUser loginUser = LoginHelper.getLoginUser();
        return !loginUser.isAdmin();
    }

    @Override
    public UserContext getUserContext() {
        LoginUser loginUser = LoginHelper.getLoginUser();
        UserContext userContext = new UserContext();
        userContext.setUserId(Convert.toStr(loginUser.getId()));
        userContext.setDeptId(Convert.toStr(loginUser.getDeptId()));
        userContext.setRoles(loginUser.getRoles()
            .stream()
            .map(r -> new RoleContext(Convert.toStr(r.getId()), DataScope.valueOf(r.getDataScope().name())))
            .collect(Collectors.toSet()));
        return userContext;
    }
}
```

1. **类声明和接口实现**

```java
public class DefaultDataPermissionUserContextProvider implements DataPermissionUserContextProvider {
```

    - 这里定义了一个公共类 `DefaultDataPermissionUserContextProvider`，并实现了 `DataPermissionUserContextProvider` 接口。这表明该类必须实现接口中定义的方法。
2. **isFilter 方法**

```java
@Override
public boolean isFilter() {
    LoginUser loginUser = LoginHelper.getLoginUser();
    return !loginUser.isAdmin();
}
```

    - `isFilter` 方法的返回值用于指示当前用户是否需要过滤数据。
    - `LoginHelper.getLoginUser()` 是一个静态方法调用，它从登录状态中获取当前用户（`LoginUser` 对象）。
    - `loginUser.isAdmin()` 检查当前用户是否是管理员，如果不是，则返回 `true`，表示需要过滤数据。
3. **getUserContext 方法**

```java
@Override
public UserContext getUserContext() {
    LoginUser loginUser = LoginHelper.getLoginUser();
    UserContext userContext = new UserContext();
```

    - `getUserContext` 方法用于创建并返回 `UserContext` 对象，该对象包含当前用户的上下文信息。
    - 同样使用 `LoginHelper.getLoginUser()` 获取当前用户信息。
4. **设置用户 ID 和部门 ID**

```java
userContext.setUserId(Convert.toStr(loginUser.getId()));
userContext.setDeptId(Convert.toStr(loginUser.getDeptId()));
```

    - 使用 `Convert.toStr()` 将当前用户的 ID 和部门 ID 转换为字符串，并分别设置到 `userContext` 对象中。
5. **设置用户角色**

```java
userContext.setRoles(loginUser.getRoles()
    .stream()
    .map(r -> new RoleContext(Convert.toStr(r.getId()), DataScope.valueOf(r.getDataScope().name())))
    .collect(Collectors.toSet()));
```

    - 获取当前用户的角色，通过流（Stream）处理这些角色。
    - 对于每个角色 `r`，创建一个 `RoleContext` 对象，并将角色的 ID 和数据范围转换为相应的值。这里使用 `DataScope.valueOf(r.getDataScope().name())` 将角色的数据范围转换为 `DataScope` 枚举。
    - 最后，将所有的角色集合变为一个 `Set` 并设置到 `userContext` 中。
6. **返回用户上下文**

```java
return userContext;
}
```

    - 返回构建好的 `userContext` 对象，包含了用户 ID、部门 ID 和角色信息。

##### `userContext` 对象如下：
```java
public class UserContext {
    private String userId;
    private Set<RoleContext> roles;
    private String deptId;

    public UserContext() {
    }

    public String getUserId() {
        return this.userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public Set<RoleContext> getRoles() {
        return this.roles;
    }

    public void setRoles(Set<RoleContext> roles) {
        this.roles = roles;
    }

    public String getDeptId() {
        return this.deptId;
    }

    public void setDeptId(String deptId) {
        this.deptId = deptId;
    }
}
```

解释：

```java
private String userId;
private Set<RoleContext> roles;
private String deptId;
```

+ `private String userId;`：用于存储用户的唯一标识符，即用户ID。
+ `private Set<RoleContext> roles;`：一个集合，存储与用户相关的角色（`RoleContext` 是另一个类，表示角色的上下文）。
+ `private String deptId;`：用于存储用户所属的部门ID。

返回结果：

```json
{
  "userId": "123",
  "deptId": "dept001",
  "roles": [
    {
      "id": "role001",
      "dataScope": "SOME_DATA_SCOPE_1"
    },
    {
      "id": "role002",
      "dataScope": "SOME_DATA_SCOPE_2"
    }
  ]
}

```

#### MybatisPlusConfiguration.java——myBatis-plus配置
```java
@Configuration
public class MybatisPlusConfiguration {

    /**
     * 元对象处理器配置（插入或修改时自动填充）
     */
    @Bean
    public MetaObjectHandler metaObjectHandler() {
        return new MyBatisPlusMetaObjectHandler();
    }

    /**
     * 数据权限用户上下文提供者
     */
    @Bean
    public DataPermissionUserContextProvider dataPermissionUserContextProvider() {
        return new DefaultDataPermissionUserContextProvider();
    }

    /**
     * BCrypt 加/解密处理器
     */
    @Bean
    public BCryptEncryptor bCryptEncryptor(PasswordEncoder passwordEncoder) {
        return new BCryptEncryptor(passwordEncoder);
    }
}
```

1. **@Configuration**  
这是一个 Spring 框架的注解，表示该类是一个配置类，Spring 会在启动时自动识别并处理该类，以便在应用上下文中注册相应的 Bean。
2. **public class MybatisPlusConfiguration**  
定义了一个公共类 `MybatisPlusConfiguration`，其中包含了多个 Bean 的定义。
3. **@Bean**  
这是一个 Spring 的注解，表示该方法返回的对象应该被 Spring 容器管理，并作为一个 Bean 存储在应用上下文中，其他组件可以通过依赖注入来使用这些 Bean。
4. **public MetaObjectHandler metaObjectHandler()**  
定义了一个返回类型为 `MetaObjectHandler` 的方法。该方法用于创建一个元对象处理器的实例，元对象处理器可以在插入或更新操作时自动填充某些字段。
5. **return new MyBatisPlusMetaObjectHandler();**  
返回一个 `MyBatisPlusMetaObjectHandler` 的新实例，该类通常扩展自 MyBatis Plus 的 `MetaObjectHandler`，实现了自动填充的逻辑。
6. **public DataPermissionUserContextProvider dataPermissionUserContextProvider()**  
定义了另一个 Bean，用于提供数据权限用户上下文。
7. **return new DefaultDataPermissionUserContextProvider();**  
返回一个 `DefaultDataPermissionUserContextProvider` 的实例，该类用于提供数据权限相关的用户上下文，使得在进行数据操作时能够根据用户的权限进行过滤。
8. **public BCryptEncryptor bCryptEncryptor(PasswordEncoder passwordEncoder)**  
定义了一个 Bean，该方法接收一个 `PasswordEncoder` 类型的参数并返回一个 `BCryptEncryptor` 的实例。
9. **return new BCryptEncryptor(passwordEncoder);**  
返回一个 `BCryptEncryptor` 的新实例，并将传入的 `PasswordEncoder` 作为参数，负责密码的加密和解密处理。

#### MyBatisPlusMetaObjectHandler.java——MyBatis Plus 元对象处理器配置（插入或修改时自动填充）
```java
public class MyBatisPlusMetaObjectHandler implements MetaObjectHandler {

    /**
     * 创建人
     */
    private static final String CREATE_USER = "createUser";
    /**
     * 创建时间
     */
    private static final String CREATE_TIME = "createTime";
    /**
     * 修改人
     */
    private static final String UPDATE_USER = "updateUser";
    /**
     * 修改时间
     */
    private static final String UPDATE_TIME = "updateTime";

    /**
     * 插入数据时填充
     *
     * @param metaObject 元对象
     */
    @Override
    public void insertFill(MetaObject metaObject) {
        try {
            if (null == metaObject) {
                return;
            }
            Long createUser = ExceptionUtils.exToNull(LoginHelper::getUserId);
            LocalDateTime createTime = LocalDateTime.now();
            if (metaObject.getOriginalObject() instanceof BaseDO baseDO) {
                // 继承了 BaseDO 的类，填充创建信息字段
                baseDO.setCreateUser(ObjectUtil.defaultIfNull(baseDO.getCreateUser(), createUser));
                baseDO.setCreateTime(ObjectUtil.defaultIfNull(baseDO.getCreateTime(), createTime));
            } else {
                // 未继承 BaseDO 的类，如存在创建信息字段则进行填充
                this.fillFieldValue(metaObject, CREATE_USER, createUser, false);
                this.fillFieldValue(metaObject, CREATE_TIME, createTime, false);
            }
        } catch (Exception e) {
            throw new BusinessException("插入数据时自动填充异常：" + e.getMessage());
        }
    }

    /**
     * 修改数据时填充
     *
     * @param metaObject 元对象
     */
    @Override
    public void updateFill(MetaObject metaObject) {
        try {
            if (null == metaObject) {
                return;
            }

            Long updateUser = LoginHelper.getUserId();
            LocalDateTime updateTime = LocalDateTime.now();
            if (metaObject.getOriginalObject() instanceof BaseDO baseDO) {
                // 继承了 BaseDO 的类，填充修改信息
                baseDO.setUpdateUser(updateUser);
                baseDO.setUpdateTime(updateTime);
            } else {
                // 未继承 BaseDO 的类，根据类中拥有的修改信息字段进行填充，不存在修改信息字段不进行填充
                this.fillFieldValue(metaObject, UPDATE_USER, updateUser, true);
                this.fillFieldValue(metaObject, UPDATE_TIME, updateTime, true);
            }
        } catch (Exception e) {
            throw new BusinessException("修改数据时自动填充异常：" + e.getMessage());
        }
    }

    /**
     * 填充字段值
     *
     * @param metaObject     元数据对象
     * @param fieldName      要填充的字段名
     * @param fillFieldValue 要填充的字段值
     * @param isOverride     如果字段值不为空，是否覆盖（true：覆盖；false：不覆盖）
     */
    private void fillFieldValue(MetaObject metaObject, String fieldName, Object fillFieldValue, boolean isOverride) {
        if (metaObject.hasSetter(fieldName)) {
            Object fieldValue = metaObject.getValue(fieldName);
            setFieldValByName(fieldName, null != fieldValue && !isOverride ? fieldValue : fillFieldValue, metaObject);
        }
    }
}
```

1. **类定义与接口实现**

```java
public class MyBatisPlusMetaObjectHandler implements MetaObjectHandler {
```

    - 该类实现了 `MetaObjectHandler` 接口，用于在 MyBatis-Plus 中处理元对象，进行插入和更新时的自动填充操作。
2. **字段定义**

```java
private static final String CREATE_USER = "createUser";
private static final String CREATE_TIME = "createTime";
private static final String UPDATE_USER = "updateUser";
private static final String UPDATE_TIME = "updateTime";
```

    - 定义了一些静态常量，用于表示创建人、创建时间、修改人和修改时间的字段名称。这些常量在后续的自动填充操作中会被使用。
3. **插入数据时填充方法**

```java
@Override
public void insertFill(MetaObject metaObject) {
```

    - 重写 `insertFill` 方法，在插入数据时被调用，用于自动填充创建人和创建时间。

```java
if (null == metaObject) {
    return;
}
```

    - 首先检查 `metaObject` 是否为 `null`，如果是则返回，不执行后续操作。

```java
Long createUser = ExceptionUtils.exToNull(LoginHelper::getUserId);//Java 8 引入的一种方法引用的写法
LocalDateTime createTime = LocalDateTime.now();
```

    - 获取当前用户的 ID（创建用户）和当前时间（创建时间）。

```java
if (metaObject.getOriginalObject() instanceof BaseDO baseDO) {
```

    - 判断 `metaObject` 的原始对象是否是 `BaseDO` 的实例，如果是，则使用 `BaseDO` 中的方法进行属性填充。

```java
baseDO.setCreateUser(ObjectUtil.defaultIfNull(baseDO.getCreateUser(), createUser));
baseDO.setCreateTime(ObjectUtil.defaultIfNull(baseDO.getCreateTime(), createTime));
```

    - 如果 `BaseDO` 对象的创建用户或创建时间为 `null`，则填充对应的值。

```java
this.fillFieldValue(metaObject, CREATE_USER, createUser, false);
this.fillFieldValue(metaObject, CREATE_TIME, createTime, false);
```

    - 如果原始对象不是 `BaseDO` 的实例，则通过 `fillFieldValue` 方法填充这些字段。
4. **修改数据时填充方法**

```java
@Override
public void updateFill(MetaObject metaObject) {
```

    - 重写 `updateFill` 方法，在更新数据时被调用，用于自动填充修改人和修改时间。

```java
Long updateUser = LoginHelper.getUserId();
LocalDateTime updateTime = LocalDateTime.now();
```

    - 获取当前用户的 ID（修改用户）和当前时间（修改时间）。

```java
if (metaObject.getOriginalObject() instanceof BaseDO baseDO) {
```

    - 判断 `metaObject` 的原始对象是否是 `BaseDO` 的实例，进行相应的属性填充。

```java
baseDO.setUpdateUser(updateUser);
baseDO.setUpdateTime(updateTime);
```

    - 直接设置 `updateUser` 和 `updateTime`。

```java
this.fillFieldValue(metaObject, UPDATE_USER, updateUser, true);
this.fillFieldValue(metaObject, UPDATE_TIME, updateTime, true);
```

    - 如果原始对象不是 `BaseDO` 的实例，则通过 `fillFieldValue` 方法填充这些字段。
5. **填充字段值的方法**

```java
private void fillFieldValue(MetaObject metaObject, String fieldName, Object fillFieldValue, boolean isOverride) {
```

    - 定义了一个私有方法 `fillFieldValue`，用于填充指定字段的值。

```java
if (metaObject.hasSetter(fieldName)) {
```

    - 检查 `metaObject` 是否有对应字段名的设置方法。

```java
Object fieldValue = metaObject.getValue(fieldName);
```

    - 获取当前字段的值，以便进行条件判断。

```java
setFieldValByName(fieldName, null != fieldValue && !isOverride ? fieldValue : fillFieldValue, metaObject);
```

    - 如果 `fieldValue` 不为 `null` 且 `isOverride` 为 `false`，则保留现有值，否则使用填充值。

### common/config/properties 
#### CaptchaProperties.java——验证码配置属性
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

#### RsaProperties.java——RSA配置属性
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

#### WebSocketClientServiceImpl.java——当前登录用户 Provider
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

### common/constant
#### CacheConstants.java——缓存相关常量
```java
public class CacheConstants {

    /**
     * 分隔符
     */
    public static final String DELIMITER = StringConstants.COLON;

    /**
     * 登录用户键
     */
    public static final String LOGIN_USER_KEY = "LOGIN_USER";

    /**
     * 验证码键前缀
     */
    public static final String CAPTCHA_KEY_PREFIX = "CAPTCHA" + DELIMITER;

    /**
     * 用户缓存键前缀
     */
    public static final String USER_KEY_PREFIX = "USER" + DELIMITER;

    /**
     * 菜单缓存键前缀
     */
    public static final String MENU_KEY_PREFIX = "MENU" + DELIMITER;

    /**
     * 字典缓存键前缀
     */
    public static final String DICT_KEY_PREFIX = "DICT" + DELIMITER;

    /**
     * 参数缓存键前缀
     */
    public static final String OPTION_KEY_PREFIX = "OPTION" + DELIMITER;

    /**
     * 仪表盘缓存键前缀
     */
    public static final String DASHBOARD_KEY_PREFIX = "DASHBOARD" + DELIMITER;

    /**
     * 用户密码错误次数缓存键前缀
     */
    public static final String USER_PASSWORD_ERROR_KEY_PREFIX = USER_KEY_PREFIX + "PASSWORD_ERROR" + DELIMITER;

    /**
     * 数据导入临时会话key
     */
    public static final String DATA_IMPORT_KEY = "SYSTEM" + DELIMITER + "DATA_IMPORT" + DELIMITER;

    private CacheConstants() {
    }
}
```

#### ContainerConstants.java——数据源容器相关常量（Crane4j 数据填充组件使用）
```java
public class ContainerConstants extends ContainerPool {

    /**
     * 用户昵称
     */
    public static final String USER_NICKNAME = ContainerPool.USER_NICKNAME;

    /**
     * 用户角色 ID 列表
     */
    public static final String USER_ROLE_ID_LIST = "UserRoleIdList";

    /**
     * 用户角色名称列表
     */
    public static final String USER_ROLE_NAME_LIST = "UserRoleNameList";

    private ContainerConstants() {
    }
}
```

```java
public class ContainerPool {
    public static final String USER_NICKNAME = "UserNickname";

    protected ContainerPool() {
    }
}
```

#### RegexConstants.java——正则相关常量
```java
public class RegexConstants {

    /**
     * 用户名正则（用户名长度为 4-64 个字符，支持大小写字母、数字、下划线，以字母开头）
     */
    public static final String USERNAME = "^[a-zA-Z][a-zA-Z0-9_]{3,64}$";

    /**
     * 密码正则模板（密码长度为 min-max 个字符，支持大小写字母、数字、特殊字符，至少包含字母和数字）
     */
    public static final String PASSWORD_TEMPLATE = "^(?=.*\\d)(?=.*[a-z]).{%s,%s}$";

    /**
     * 密码正则（密码长度为 8-32 个字符，支持大小写字母、数字、特殊字符，至少包含字母和数字）
     */
    public static final String PASSWORD = "^(?=.*\\d)(?=.*[a-z]).{8,32}$";

    /**
     * 特殊字符正则
     */
    public static final String SPECIAL_CHARACTER = "[-_`~!@#$%^&*()+=|{}':;',\\\\[\\\\].<>/?~！@#￥%……&*（）——+|{}【】‘；：”“’。，、？]|\\n|\\r|\\t";

    /**
     * 通用编码正则（长度为 2-30 个字符，支持大小写字母、数字、下划线，以字母开头）
     */
    public static final String GENERAL_CODE = "^[a-zA-Z][a-zA-Z0-9_]{1,29}$";

    /**
     * 通用名称正则（长度为 2-30 个字符，支持中文、字母、数字、下划线，短横线）
     */
    public static final String GENERAL_NAME = "^[\\u4e00-\\u9fa5a-zA-Z0-9_-]{2,30}$";

    /**
     * 包名正则（可以包含大小写字母、数字、下划线，每一级包名不能以数字开头）
     */
    public static final String PACKAGE_NAME = "^(?:[a-zA-Z_][a-zA-Z0-9_]*\\.)*[a-zA-Z_][a-zA-Z0-9_]*$";

    private RegexConstants() {
    }
}
```

SysConstants.java——系统相关常量

```java
public class SysConstants {

    /**
     * 否
     */
    public static final Integer NO = 0;

    /**
     * 是
     */
    public static final Integer YES = 1;

    /**
     * 管理员角色编码
     */
    public static final String ADMIN_ROLE_CODE = "admin";

    /**
     * 顶级部门 ID
     */
    public static final Long SUPER_DEPT_ID = 1L;

    /**
     * 顶级父 ID
     */
    public static final Long SUPER_PARENT_ID = 0L;

    /**
     * 全部权限标识
     */
    public static final String ALL_PERMISSION = "*:*:*";

    /**
     * 账号登录 URI
     */
    public static final String LOGIN_URI = "/auth/account";

    /**
     * 退出 URI
     */
    public static final String LOGOUT_URI = "/auth/logout";

    /**
     * 描述类字段后缀
     */
    public static final String DESCRIPTION_FIELD_SUFFIX = "String";

    private SysConstants() {
    }//这是一个私有构造函数，防止外部实例化该类。因为这个类只包含静态常量，没有必要创建对象
}
```

#### UiConstants.java——ui相关常量
```java
public class UiConstants {

    /**
     * 主色（极致蓝）
     */
    public static final String COLOR_PRIMARY = "arcoblue";

    /**
     * 成功色（仙野绿）
     */
    public static final String COLOR_SUCCESS = "green";

    /**
     * 警告色（活力橙）
     */
    public static final String COLOR_WARNING = "orangered";

    /**
     * 错误色（浪漫红）
     */
    public static final String COLOR_ERROR = "red";

    /**
     * 默认色（中性灰）
     */
    public static final String COLOR_DEFAULT = "gray";

    private UiConstants() {
    }
}
```

### common/enums
#### DataScopeEnum.java——数据权限枚举
```java
@Getter
@RequiredArgsConstructor
public enum DataScopeEnum implements BaseEnum<Integer> {

    /**
     * 全部数据权限
     */
    ALL(1, "全部数据权限"),

    /**
     * 本部门及以下数据权限
     */
    DEPT_AND_CHILD(2, "本部门及以下数据权限"),

    /**
     * 本部门数据权限
     */
    DEPT(3, "本部门数据权限"),

    /**
     * 仅本人数据权限
     */
    SELF(4, "仅本人数据权限"),

    /**
     * 自定义数据权限
     */
    CUSTOM(5, "自定义数据权限"),;

    private final Integer value;
    private final String description;
}
```

#### DisEnableStatusEnum.java——启动禁用状态枚举
```java
public enum DisEnableStatusEnum implements BaseEnum<Integer> {

    /**
     * 启用
     */
    ENABLE(1, "启用", UiConstants.COLOR_SUCCESS),

    /**
     * 禁用
     */
    DISABLE(2, "禁用", UiConstants.COLOR_ERROR),;

    private final Integer value;
    private final String description;
    private final String color;
}
```

### common/model/Dto
#### LoginUser——登陆用户信息
```java
@Data
@NoArgsConstructor
public class LoginUser implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * ID
     */
    private Long id;

    /**
     * 用户名
     */
    private String username;

    /**
     * 部门 ID
     */
    private Long deptId;

    /**
     * 权限码集合
     */
    private Set<String> permissions;

    /**
     * 角色编码集合
     */
    private Set<String> roleCodes;

    /**
     * 角色集合
     */
    private Set<RoleDTO> roles;

    /**
     * 令牌
     */
    private String token;

    /**
     * IP
     */
    private String ip;

    /**
     * IP 归属地
     */
    private String address;

    /**
     * 浏览器
     */
    private String browser;

    /**
     * 操作系统
     */
    private String os;

    /**
     * 登录时间
     */
    private LocalDateTime loginTime;

    /**
     * 最后一次修改密码时间
     */
    private LocalDateTime pwdResetTime;

    /**
     * 登录时系统设置的密码过期天数
     */
    private Integer passwordExpirationDays;

    public LoginUser(Set<String> permissions, Set<RoleDTO> roles, Integer passwordExpirationDays) {
        this.permissions = permissions;
        this.setRoles(roles);
        this.passwordExpirationDays = passwordExpirationDays;
    }

    public void setRoles(Set<RoleDTO> roles) {
        this.roles = roles;
        this.roleCodes = roles.stream().map(RoleDTO::getCode).collect(Collectors.toSet());
    }

    /**
     * 是否为管理员
     *
     * @return true：是；false：否
     */
    public boolean isAdmin() {
        if (CollUtil.isEmpty(roleCodes)) {
            return false;
        }
        return roleCodes.contains(SysConstants.ADMIN_ROLE_CODE);
    }

    /**
     * 密码是否已过期
     *
     * @return 是否过期
     */
    public boolean isPasswordExpired() {
        // 永久有效
        if (this.passwordExpirationDays == null || this.passwordExpirationDays <= SysConstants.NO) {
            return false;
        }
        // 初始密码（第三方登录用户）暂不提示修改
        if (this.pwdResetTime == null) {
            return false;
        }
        return this.pwdResetTime.plusDays(this.passwordExpirationDays).isBefore(LocalDateTime.now());
    }
}

```

1. **类注解与定义**

```java
@Data
@NoArgsConstructor
public class LoginUser implements Serializable {
```

    - `@Data`：这是Lombok库提供的注解，用于自动生成常用的方法，比如getter、setter、toString、hashCode和equals等，提高代码的简洁性。
    - `@NoArgsConstructor`：也是Lombok的注解，生成一个无参构造函数。
    - `implements Serializable`：表示该类可以被序列化，方便在网络传输或持久化存储。
2. **序列化标识**

```java
@Serial
private static final long serialVersionUID = 1L;
```

    - `@Serial`：用于标识序列化的版本控制。`serialVersionUID`是用来验证序列化的对象版本。
3. **字段定义**

```java
private Long id;
private String username;
private Long deptId;
private Set<String> permissions;
private Set<String> roleCodes;
private Set<RoleDTO> roles;
private String token;
private String ip;
private String address;
private String browser;
private String os;
private LocalDateTime loginTime;
private LocalDateTime pwdResetTime;
private Integer passwordExpirationDays;
```

CopyInsert

    - 定义了多个属性，主要用于存储用户的基本信息及其登录相关的信息。
    - `Long id`：用户的唯一标识符。
    - `String username`：用户的名称。
    - `Long deptId`：用户所属部门的ID。
    - `Set<String> permissions`：用户拥有的权限集合。
    - `Set<String> roleCodes`：用户角色编码集合。
    - `Set<RoleDTO> roles`：用户的角色集合。
    - `String token`：用户的登录凭据。
    - `String ip` 和 `String address`：记录用户的IP地址及其归属地。
    - `String browser` 和 `String os`：记录用户使用的浏览器及操作系统信息。
    - `LocalDateTime loginTime`：记录用户登录的时间。
    - `LocalDateTime pwdResetTime`：记录用户最后一次修改密码的时间。
    - `Integer passwordExpirationDays`：设置密码有效期的天数。
4. **构造函数**

```java
public LoginUser(Set<String> permissions, Set<RoleDTO> roles, Integer passwordExpirationDays) {
    this.permissions = permissions;
    this.setRoles(roles);
    this.passwordExpirationDays = passwordExpirationDays;
}
```

CopyInsert

    - 这个构造函数用于创建 `LoginUser` 对象，并初始化用户的权限、角色和密码有效期。
5. **setter方法**

```java
public void setRoles(Set<RoleDTO> roles) {
    this.roles = roles;
    this.roleCodes = roles.stream().map(RoleDTO::getCode).collect(Collectors.toSet());
}
```

CopyInsert

    - 这个方法不仅设置角色集合，还根据角色集合提取角色编码并存储到 `roleCodes` 属性中。
6. **管理员判断方法**

```java
public boolean isAdmin() {
    if (CollUtil.isEmpty(roleCodes)) {
        return false;
    }
    return roleCodes.contains(SysConstants.ADMIN_ROLE_CODE);
}
```



    - 这个方法检查用户是否是管理员，通过判断角色编码集合是否包含管理员角色的编码。
7. **密码过期判断方法**
    - 这个方法用于判断密码是否过期。它会检查权限有效期，判断用户是否有最后修改密码的时间，并基于这些信息返回是否过期。

```java
public boolean isPasswordExpired() {
    // 永久有效
    if (this.passwordExpirationDays == null || this.passwordExpirationDays <= SysConstants.NO) {
        return false;
    }
    // 初始密码（第三方登录用户）暂不提示修改
    if (this.pwdResetTime == null) {
        return false;
    }
    return this.pwdResetTime.plusDays(this.passwordExpirationDays).isBefore(LocalDateTime.now());
}
```

该代码定义了一个 `LoginUser` 类，主要用于管理用户的登录信息和权限。它包含多个属性来存储有关用户的详细信息，如用户ID、用户名、部门ID、权限和角色等。通过Lombok库的注解简化了常用方法的生成，使代码更加简洁易读。

该类的主要功能包括：

+ 存储用户登录信息和权限信息。
+ 提供判断用户是否为管理员的方法。
+ 提供判断用户密码是否过期的方法。

#### RoleDto——角色信息
```java
@Data
public class RoleDTO implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * ID
     */
    private Long id;

    /**
     * 角色编码
     */
    private String code;

    /**
     * 数据权限
     */
    private DataScopeEnum dataScope;
}
```

### common/model/resp
#### CaptchaResp
```java
@Data
@Builder
@Schema(description = "验证码信息")
public class CaptchaResp implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 验证码标识
     */
    @Schema(description = "验证码标识", example = "090b9a2c-1691-4fca-99db-e4ed0cff362f")
    private String uuid;

    /**
     * 验证码图片（Base64编码，带图片格式：data:image/gif;base64）
     */
    @Schema(description = "验证码图片（Base64编码，带图片格式：data:image/gif;base64）", example = "data:image/png;base64,iVBORw0KGgoAAAAN...")
    private String img;

    /**
     * 过期时间戳
     */
    @Schema(description = "过期时间戳", example = "1714376969409")
    private Long expireTime;
}
```

### common/util/helper
#### LoginHelper.java
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

##### 代码逐步分解和详细解释
###### 1. 类定义
```java
public class LoginHelper {
    private LoginHelper() {
    }
}
```



+ `LoginHelper` 是一个工具类，使用私有构造函数阻止<font style="color:#DF2A3F;">实例化</font>，表明该类提供静态方法，而不需要创建对象。

###### 2. 登录方法
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

###### 3. 更新用户信息
```java
public static void updateLoginUser(LoginUser loginUser, String token) {
    SaHolder.getStorage().delete(CacheConstants.LOGIN_USER_KEY);
    StpUtil.getTokenSessionByToken(token).set(CacheConstants.LOGIN_USER_KEY, loginUser);
}
```



+ 此方法用于更新已登录用户的信息。
+ 它先删除存储中的旧用户信息，然后将新的 `loginUser` 信息以令牌为索引存入。

###### 4. 获取当前登录用户信息
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

###### 5. 根据 Token 获取用户信息
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

###### 6. 获取用户 ID 和用户名
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

###### 7. 获取用户昵称
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

###### 代码总结
`LoginHelper` 类提供了一系列静态方法，用于处理用户的登录、信息更新以及获取用户信息的功能。主要功能包括：

+ 登录并缓存用户信息。
+ 更新已登录用户的信息。
+ 获取当前登录用户的详细信息。
+ 根据 Token 获取用户信息。
+ 提供获取当前登录用户 ID、用户名和昵称的方法。

该类通过与 `SaToken` 和 `Hutool` 等库的集成，为应用程序提供了简洁而高效的用户认证和信息管理解决方案。

### common/util
#### SecureUtils.java——加密解密工具类
```java
public class SecureUtils {

    private SecureUtils() {
    }

    /**
     * 私钥解密
     *
     * @param data 要解密的内容（Base64 加密过）
     * @return 解密后的内容
     */
    public static String decryptByRsaPrivateKey(String data) {
        String privateKey = RsaProperties.PRIVATE_KEY;
        ValidationUtils.throwIfBlank(privateKey, "请配置 RSA 私钥");
        return decryptByRsaPrivateKey(data, privateKey);
    }

    /**
     * 私钥解密
     *
     * @param data       要解密的内容（Base64 加密过）
     * @param privateKey 私钥
     * @return 解密后的内容
     */
    public static String decryptByRsaPrivateKey(String data, String privateKey) {
        return new String(SecureUtil.rsa(privateKey, null).decrypt(Base64.decode(data), KeyType.PrivateKey));
    }

    /**
     * 对普通加密字段列表进行AES加密，优化starter加密模块后优化这个方法
     *
     * @param values 待加密内容
     * @return 加密后内容
     */
    public static List<String> encryptFieldByAes(List<String> values) {
        IEncryptor encryptor = new AesEncryptor();
        CryptoProperties properties = SpringUtil.getBean(CryptoProperties.class);
        return values.stream().map(value -> {
            try {
                return encryptor.encrypt(value, properties.getPassword(), properties.getPublicKey());
            } catch (Exception e) {
                throw new BusinessException("字段加密异常");
            }
        }).collect(Collectors.toList());
    }
}
```

##### 1. 类定义
```java
public class SecureUtils {
```



+ 这是一个名为 `SecureUtils` 的工具类，通常用于提供安全相关的功能，例如加密和解密方法。

##### 2. 私有构造函数
```java
private SecureUtils() {
}
```



+ 该类的构造函数是私有的，这意味着无法在类外创建 `SecureUtils` 的实例。此设计用于防止实例化该工具类，因为工具类通常只包含静态方法。

##### 3. 方法 `decryptByRsaPrivateKey` (带单一参数)
```java
public static String decryptByRsaPrivateKey(String data) {
    String privateKey = RsaProperties.PRIVATE_KEY;
    ValidationUtils.throwIfBlank(privateKey, "请配置 RSA 私钥");
    return decryptByRsaPrivateKey(data, privateKey);
}
```



+ **功能**：使用 RSA 私钥解密传入的 Base64 编码数据。
+ **参数**：`data`，即需要解密的内容（经过 Base64 编码）。
+ **过程**：
    - 从 `RsaProperties` 中获取私钥。
    - 检查私钥是否为空，如果为空则抛出异常，提示用户配置私钥。
    - 调用重载的解密方法，并传入 `data` 和 `privateKey`。

##### 4. 方法 `decryptByRsaPrivateKey` (带两个参数)
```java
public static String decryptByRsaPrivateKey(String data, String privateKey) {
    return new String(SecureUtil.rsa(privateKey, null).decrypt(Base64.decode(data), KeyType.PrivateKey));
}
```



+ **功能**：使用传入的 RSA 私钥解密 Base64 编码的内容。
+ **参数**：
    - `data`：经过 Base64 编码的数据。
    - `privateKey`：用于解密的私钥。
+ **过程**：
    - 使用 `cn.hutool.crypto.SecureUtil` 提供的 RSA 解密工具，解码 `data`，并进行解密操作。
    - 返回解密后的内容，类型转换为字符串。

##### 5. 方法 `encryptFieldByAes`
```java
public static List<String> encryptFieldByAes(List<String> values) {
    IEncryptor encryptor = new AesEncryptor();
    CryptoProperties properties = SpringUtil.getBean(CryptoProperties.class);
    return values.stream().map(value -> {
        try {
            return encryptor.encrypt(value, properties.getPassword(), properties.getPublicKey());
        } catch (Exception e) {
            throw new BusinessException("字段加密异常");
        }
    }).collect(Collectors.toList());
}
```



+ **功能**：对一组普通字符串进行 AES 加密。
+ **参数**：`values`，一个待加密的字符串列表。
+ **过程**：
    - 创建一个 `AesEncryptor` 实例以进行 AES 加密。
    - 从 Spring 上下文中获取加密配置（如密码和公钥）。
    - 对于 `values` 中的每个值，调用加密方法进行加密，并捕获可能的异常。
    - 如果在加密过程中出现异常，抛出自定义的业务异常。
    - 最后，将加密后的内容收集到一个列表中并返回。

##### 总结
`SecureUtils` 类提供了用于加密和解密的工具方法。它支持使用 RSA 私钥解密经过 Base64 编码的数据，以及支持批量对字符串列表进行 AES 加密。该类具有私有构造函数，确保不能被实例化，并通过一系列静态方法提供访问功能。主要功能集中在提供安全的字符串处理，适合需要保护敏感数据的应用程序。

## Continew-Admin-webapi模块
### /config/log
#### LogConfiguration.java——日志配置
```java
@Configuration
@ConditionalOnEnabledLog
public class LogConfiguration {

    /**
     * 日志持久层接口本地实现类
     */
    @Bean
    public LogDao logDao(UserService userService, LogMapper logMapper, TraceProperties traceProperties) {
        return new LogDaoLocalImpl(userService, logMapper, traceProperties);
    }
}
```

1. **@Configuration 注解**：
    - 这个注解表示该类是一个Spring配置类。Spring会在此类中定义的@Bean方法返回的对象视作Spring容器中的bean。
    - Spring容器会自动识别此类，进而进行相关的初始化，确保配置中的依赖关系能够正确管理。
2. **@ConditionalOnEnabledLog 注解**：
    - 这个注解是一个条件注解，用于控制配置类的加载。只有在满足特定条件（如日志功能被启用）时，该配置才会生效。
    - 具体条件的判断通常会依赖于应用的配置文件（如application.properties或application.yml）。
3. **类定义**：
    - `public class LogConfiguration` 声明了一个公共类`LogConfiguration`，该类负责日志相关的配置。
4. **logDao 方法**：
    - `@Bean`注解说明此方法会返回一个Spring管理的bean。
    - 方法名`logDao`可以用于在其他部分引用这个bean。
    - `public LogDao logDao(UserService userService, LogMapper logMapper, TraceProperties traceProperties)` 定义了一个返回类型为`LogDao`的方法，接收三个参数：
        * `UserService userService`：用户服务的接口，用于处理用户相关的操作。
        * `LogMapper logMapper`：日志的持久层映射器，负责数据库操作。
        * `TraceProperties traceProperties`：跟踪相关的属性配置。
    - 在方法体中，返回一个`LogDaoLocalImpl`的实例，这个类是`LogDao`接口的本地实现，表示具体的日志数据操作实现。
5. **返回对象**：
    - `new LogDaoLocalImpl(userService, logMapper, traceProperties)` 创建`LogDaoLocalImpl`的对象，并将之前提到的服务和配置注入，以实现业务逻辑。

#### LogDaoLocalImpl.java——日志持久层接口本地实现类
```java
@RequiredArgsConstructor
public class LogDaoLocalImpl implements LogDao {

    private final UserService userService;
    private final LogMapper logMapper;
    private final TraceProperties traceProperties;

    @Async
    @Override
    public void add(LogRecord logRecord) {
        LogDO logDO = new LogDO();
        // 设置请求信息
        LogRequest logRequest = logRecord.getRequest();
        this.setRequest(logDO, logRequest);
        // 设置响应信息
        LogResponse logResponse = logRecord.getResponse();
        this.setResponse(logDO, logResponse);
        // 设置基本信息
        logDO.setDescription(logRecord.getDescription());
        logDO.setModule(StrUtils.blankToDefault(logRecord.getModule(), null, m -> m
            .replace("API", StringConstants.EMPTY)
            .trim()));
        logDO.setTimeTaken(logRecord.getTimeTaken().toMillis());
        logDO.setCreateTime(LocalDateTime.ofInstant(logRecord.getTimestamp(), ZoneId.systemDefault()));
        // 设置操作人
        this.setCreateUser(logDO, logRequest, logResponse);
        logMapper.insert(logDO);
    }

    /**
     * 设置请求信息
     *
     * @param logDO      日志信息
     * @param logRequest 请求信息
     */
    private void setRequest(LogDO logDO, LogRequest logRequest) {
        logDO.setRequestMethod(logRequest.getMethod());
        logDO.setRequestUrl(logRequest.getUrl().toString());
        logDO.setRequestHeaders(JSONUtil.toJsonStr(logRequest.getHeaders()));
        logDO.setRequestBody(logRequest.getBody());
        logDO.setIp(logRequest.getIp());
        logDO.setAddress(logRequest.getAddress());
        logDO.setBrowser(logRequest.getBrowser());
        logDO.setOs(StrUtil.subBefore(logRequest.getOs(), " or", false));
    }

    /**
     * 设置响应信息
     *
     * @param logDO       日志信息
     * @param logResponse 响应信息
     */
    private void setResponse(LogDO logDO, LogResponse logResponse) {
        Map<String, String> responseHeaders = logResponse.getHeaders();
        logDO.setResponseHeaders(JSONUtil.toJsonStr(responseHeaders));
        logDO.setTraceId(responseHeaders.get(traceProperties.getTraceIdName()));
        String responseBody = logResponse.getBody();
        logDO.setResponseBody(responseBody);
        // 状态
        Integer statusCode = logResponse.getStatus();
        logDO.setStatusCode(statusCode);
        logDO.setStatus(statusCode >= HttpStatus.HTTP_BAD_REQUEST ? LogStatusEnum.FAILURE : LogStatusEnum.SUCCESS);
        if (StrUtil.isNotBlank(responseBody)) {
            R result = JSONUtil.toBean(responseBody, R.class);
            if (!result.isSuccess()) {
                logDO.setStatus(LogStatusEnum.FAILURE);
                logDO.setErrorMsg(result.getMsg());
            }
        }
    }

    /**
     * 设置操作人
     *
     * @param logDO       日志信息
     * @param logRequest  请求信息
     * @param logResponse 响应信息
     */
    private void setCreateUser(LogDO logDO, LogRequest logRequest, LogResponse logResponse) {
        String requestUri = URLUtil.getPath(logDO.getRequestUrl());
        // 解析退出接口信息
        String responseBody = logResponse.getBody();
        if (requestUri.startsWith(SysConstants.LOGOUT_URI) && StrUtil.isNotBlank(responseBody)) {
            R result = JSONUtil.toBean(responseBody, R.class);
            logDO.setCreateUser(Convert.toLong(result.getData(), null));
            return;
        }
        // 解析登录接口信息
        if (requestUri.startsWith(SysConstants.LOGIN_URI) && LogStatusEnum.SUCCESS.equals(logDO.getStatus())) {
            String requestBody = logRequest.getBody();
            AccountLoginReq loginReq = JSONUtil.toBean(requestBody, AccountLoginReq.class);
            logDO.setCreateUser(ExceptionUtils.exToNull(() -> userService.getByUsername(loginReq.getUsername())
                .getId()));
            return;
        }
        // 解析 Token 信息
        Map<String, String> requestHeaders = logRequest.getHeaders();
        String headerName = HttpHeaders.AUTHORIZATION;
        boolean isContainsAuthHeader = CollUtil.containsAny(requestHeaders.keySet(), Set.of(headerName, headerName
            .toLowerCase()));
        if (MapUtil.isNotEmpty(requestHeaders) && isContainsAuthHeader) {
            String authorization = requestHeaders.getOrDefault(headerName, requestHeaders.get(headerName
                .toLowerCase()));
            String token = authorization.replace(SaManager.getConfig()
                .getTokenPrefix() + StringConstants.SPACE, StringConstants.EMPTY);
            logDO.setCreateUser(Convert.toLong(StpUtil.getLoginIdByToken(token)));
        }
    }
}
```

##### 类及其成员变量
```java
@RequiredArgsConstructor
public class LogDaoLocalImpl implements LogDao {
    private final UserService userService;
    private final LogMapper logMapper;
    private final TraceProperties traceProperties;
}
```

DiffCopyInsert

+ `@RequiredArgsConstructor`：这个注解将为所有 `final` 变量生成一个带参数的构造函数，允许在实例化 `LogDaoLocalImpl` 时传入这些依赖。
+ `UserService userService`、`LogMapper logMapper`、`TraceProperties traceProperties` 是类的成员变量，分别用于用户服务、日志数据库操作和追踪配置。

##### 方法 `add(LogRecord logRecord)`
```java
@Async
@Override
public void add(LogRecord logRecord) {
    LogDO logDO = new LogDO();
```

DiffCopyInsert

+ `@Async`：这个注解表示该方法会异步执行，有助于提升性能，因为日志记录的过程可能不需要立即完成，可以在后台进行。
+ `LogDO logDO = new LogDO();`：创建一个新的 `LogDO` 实例，用于存储日志数据。

##### 设置请求信息
```java
LogRequest logRequest = logRecord.getRequest();
this.setRequest(logDO, logRequest);
```

DiffCopyInsert

+ `LogRequest logRequest = logRecord.getRequest();`：从 `logRecord` 获取请求信息。
+ `this.setRequest(logDO, logRequest);`：调用 `setRequest` 方法，将请求信息填充到 `logDO` 对象中。

##### 设置响应信息
```java
LogResponse logResponse = logRecord.getResponse();
this.setResponse(logDO, logResponse);
```

DiffCopyInsert

+ 获取响应信息并调用 `setResponse` 方法将其填充到 `logDO` 对象中。

##### 设置基本信息
```java
logDO.setDescription(logRecord.getDescription());
logDO.setModule(StrUtils.blankToDefault(logRecord.getModule(), null, m -> m
    .replace("API", StringConstants.EMPTY)
    .trim()));
logDO.setTimeTaken(logRecord.getTimeTaken().toMillis());
logDO.setCreateTime(LocalDateTime.ofInstant(logRecord.getTimestamp(), ZoneId.systemDefault()));
```

DiffCopyInsert

+ 设置日志描述、模块（去掉字符串中的 "API"）、耗时（转换为毫秒）和创建时间（转换时区）。

##### 设置操作人
```java
this.setCreateUser(logDO, logRequest, logResponse);
logMapper.insert(logDO);
```

DiffCopyInsert

+ 最后通过调用 `setCreateUser`方法填充操作人信息，并将 `logDO` 数据插入到数据库中。

##### 私有方法 `setRequest(LogDO logDO, LogRequest logRequest)`
```java
private void setRequest(LogDO logDO, LogRequest logRequest) {
    logDO.setRequestMethod(logRequest.getMethod());
    logDO.setRequestUrl(logRequest.getUrl().toString());
    logDO.setRequestHeaders(JSONUtil.toJsonStr(logRequest.getHeaders()));
    logDO.setRequestBody(logRequest.getBody());
    logDO.setIp(logRequest.getIp());
    logDO.setAddress(logRequest.getAddress());
    logDO.setBrowser(logRequest.getBrowser());
    logDO.setOs(StrUtil.subBefore(logRequest.getOs(), " or", false));
}
```

DiffCopyInsert

+ 此方法详细接收 `logRequest` 信息，设置到 `logDO` 中，涉及请求方法、URL、头信息、请求体、IP 地址、访问地址、浏览器类型和操作系统。
+ `StrUtil.subBefore(logRequest.getOs(), " or", false)` 是用来提取操作系统字符串中的主要部分，例如 "Windows 10 or Windows 11" 会被处理成 "Windows 10"。

##### 私有方法 `setResponse(LogDO logDO, LogResponse logResponse)`
```java
private void setResponse(LogDO logDO, LogResponse logResponse) {
    Map<String, String> responseHeaders = logResponse.getHeaders();
    logDO.setResponseHeaders(JSONUtil.toJsonStr(responseHeaders));
    logDO.setTraceId(responseHeaders.get(traceProperties.getTraceIdName()));
    String responseBody = logResponse.getBody();
    logDO.setResponseBody(responseBody);
    Integer statusCode = logResponse.getStatus();
    logDO.setStatusCode(statusCode);
    logDO.setStatus(statusCode >= HttpStatus.HTTP_BAD_REQUEST ? LogStatusEnum.FAILURE : LogStatusEnum.SUCCESS);
    if (StrUtil.isNotBlank(responseBody)) {
        R result = JSONUtil.toBean(responseBody, R.class);
        if (!result.isSuccess()) {
            logDO.setStatus(LogStatusEnum.FAILURE);
            logDO.setErrorMsg(result.getMsg());
        }
    }
}
```

DiffCopyInsert

+ 设置响应信息，包括响应头、Trace ID、响应体和状态码。
+ 在此方法中，首先获取响应头信息并转换为 JSON 字符串，然后提取 Trace ID 和响应体。
+ 通过状态码判断操作是否成功并设置相应的状态，如果响应体不为空且不成功，则记录失败状态和错误信息。

##### 私有方法 `setCreateUser(LogDO logDO, LogRequest logRequest, LogResponse logResponse)`
```java
private void setCreateUser(LogDO logDO, LogRequest logRequest, LogResponse logResponse) {
    String requestUri = URLUtil.getPath(logDO.getRequestUrl());
    String responseBody = logResponse.getBody();
    if (requestUri.startsWith(SysConstants.LOGOUT_URI) && StrUtil.isNotBlank(responseBody)) {
        R result = JSONUtil.toBean(responseBody, R.class);
        logDO.setCreateUser(Convert.toLong(result.getData(), null));
        return;
    }
    if (requestUri.startsWith(SysConstants.LOGIN_URI) && LogStatusEnum.SUCCESS.equals(logDO.getStatus())) {
        String requestBody = logRequest.getBody();
        AccountLoginReq loginReq = JSONUtil.toBean(requestBody, AccountLoginReq.class);
        logDO.setCreateUser(ExceptionUtils.exToNull(() -> userService.getByUsername(loginReq.getUsername()).getId()));
        return;
    }
    Map<String, String> requestHeaders = logRequest.getHeaders();
    String headerName = HttpHeaders.AUTHORIZATION;
    boolean isContainsAuthHeader = CollUtil.containsAny(requestHeaders.keySet(), Set.of(headerName, headerName.toLowerCase()));
    if (MapUtil.isNotEmpty(requestHeaders) && isContainsAuthHeader) {
        String authorization = requestHeaders.getOrDefault(headerName, requestHeaders.get(headerName.toLowerCase()));
        String token = authorization.replace(SaManager.getConfig().getTokenPrefix() + StringConstants.SPACE, StringConstants.EMPTY);
        logDO.setCreateUser(Convert.toLong(StpUtil.getLoginIdByToken(token)));
    }
}
```

DiffCopyInsert

+ 该方法负责解析请求 URI 以确定用户的身份。
    - 如果是登出请求，从响应中提取用户信息。
    - 如果是登录请求，解析请求体中的登录信息并根据用户名查找用户 ID。
    - 对于其他请求，通过 Authorization 头获取 token，进一步提取用户 ID。

##### 总结
`LogDaoLocalImpl` 类实现了日志记录的功能，主要包括：

1. **日志记录的持久化**：通过 `add` 方法将日志信息持久化到数据库。
2. **请求和响应的详细处理**：通过私有方法将请求和响应的信息细致地封装到日志对象中。
3. **用户信息的动态获取**：根据请求类型智能解析用户信息。
4. **异步操作**：使用 `@Async` 提升性能，使得日志记录不会阻塞请求处理流程。

该实现具有良好的扩展性和可维护性，适合在微服务架构或高并发环境下使用。

### /saToken
#### LoginPasswordProperties.java——密码配置属性
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

#### SaTokenConfiguration.java——saToken配置
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

##### 逐步分解
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

##### 总结
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

##### 类声明
```java
public class SaTokenPermissionImpl implements StpInterface {
```

CopyInsert

+ `public class SaTokenPermissionImpl`：定义了一个公开的类 `SaTokenPermissionImpl`。
+ `implements StpInterface`：这个类实现了 `StpInterface` 接口，因此它需要提供该接口中所有方法的具体实现。

##### 2. getPermissionList 方法
```java
@Override
public List<String> getPermissionList(Object loginId, String loginType) {
    LoginUser loginUser = LoginHelper.getLoginUser();
    return new ArrayList<>(loginUser.getPermissions());
}
```

CopyInsert

###### 方法功能
+ `@Override`：表示这个方法是对接口中定义的方法的重写。
+ `public List<String> getPermissionList(Object loginId, String loginType)`：该方法返回一个 `List<String>` 类型的权限列表。方法参数包括 `loginId`（用户登录ID）和 `loginType`（用户登录类型），但在方法内未使用这两个参数。

###### 方法实现
+ `LoginUser loginUser = LoginHelper.getLoginUser();`：通过 `LoginHelper` 类获取当前登录用户的信息，返回一个 `LoginUser` 对象。
+ `return new ArrayList<>(loginUser.getPermissions());`：调用 `loginUser` 上的 `getPermissions()` 方法获取这个用户的权限列表，并将其转换为 `ArrayList` 返回。这样做的目的是为了确保返回的列表是一个可修改的具体实现。

##### 3. getRoleList 方法
```java
@Override
public List<String> getRoleList(Object loginId, String loginType) {
    LoginUser loginUser = LoginHelper.getLoginUser();
    return new ArrayList<>(loginUser.getRoleCodes());
}
```

CopyInsert

###### 方法功能
+ `@Override`：同样表示这个方法是对接口中定义的方法的重写。
+ `public List<String> getRoleList(Object loginId, String loginType)`：该方法返回一个 `List<String>` 类型的角色列表。

###### 方法实现
+ `LoginUser loginUser = LoginHelper.getLoginUser();`：同样地，通过 `LoginHelper` 获取当前登录的用户信息。
+ `return new ArrayList<>(loginUser.getRoleCodes());`：调用 `loginUser` 的 `getRoleCodes()` 方法以获得当前用户的角色代码，并将其转换为 `ArrayList` 返回。

##### 代码总结
总体而言，`SaTokenPermissionImpl` 类实现了 `StpInterface` 接口，主要功能是根据当前登录用户的信息提供其权限和角色列表。具体而言：

+ `getPermissionList` 方法返回当前用户的权限列表。
+ `getRoleList` 方法返回当前用户的角色列表。 这两个方法通过 `LoginHelper` 获取当前用户的登录信息，从而实现对用户权限与角色的动态获取。这个实现可以在需要进行权限验证的系统中使用，以确定用户能够执行的操作和所拥有的角色。

### /controller/auth
#### AuthController.java——认证Api
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

#### SocialAuthController.java——三方账号认证api
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

##### 1. 注释与包声明
```java
@Log(module = "登录")
@Tag(name = "三方账号认证 API")
@SaIgnore
@RestController
@RequiredArgsConstructor
@RequestMapping("/oauth")
public class SocialAuthController {
```

CopyInsert

+ `@Log(module = "登录")`：用于记录日志的注解，可以用于跟踪和监控登录模块的操作。
+ `@Tag(name = "三方账号认证 API")`：OpenAPI注解，定义API的标签，用于生成API文档。
+ `@SaIgnore`：可能用于跳过某些安全检查的注解。
+ `@RestController`：表明该类是一个控制器，返回的内容会被序列化为JSON。
+ `@RequiredArgsConstructor`：自动生成带有所有`final`字段的构造函数的注解，用于依赖注入。
+ `@RequestMapping("/oauth")`：定义该控制器处理以`/oauth`开头的请求。

##### 2. 变量声明
```java
private final LoginService loginService;
private final AuthRequestFactory authRequestFactory;
```

CopyInsert

+ `loginService`：处理用户登录逻辑的服务。
+ `authRequestFactory`：用于创建不同第三方认证请求的工厂类。

##### 3. 授权方法
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

CopyInsert

+ `@Operation`和`@Parameter`：用于OpenAPI文档的描述。
+ `@GetMapping("/{source}")`：处理HTTP GET请求，可以传入第三方平台的标识（如“gitee”）。
+ `authorize`方法：根据来源获取授权请求，并返回一个包含授权URL的响应对象。
    - 调用`getAuthRequest(source)`获取对应的`AuthRequest`。
    - 使用`authRequest.authorize()`生成授权链接。

##### 4. 登录方法
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

CopyInsert

+ `@PostMapping("/{source}")`：处理HTTP POST请求。
+ `login`方法：处理第三方用户的登录逻辑。
    - 首先检查用户是否已经登录，如已登录，则调用`StpUtil.logout()`注销当前用户。
    - 请求第三方API进行登录，并使用`callback`参数（通常包含用户授权后的返回信息）。
    - 检查响应是否成功，如果不成功抛出异常。
    - 获取用户信息后，通过`loginService.socialLogin(authUser)`生成访问令牌，并返回该令牌。

##### 5. 获取认证请求的方法
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

### controller/common
#### CaptchaController.java——验证码Api
```java
@Tag(name = "验证码 API")
@SaIgnore
@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("/captcha")
public class CaptchaController {

    private final ProjectProperties projectProperties;
    private final CaptchaProperties captchaProperties;
    private final CaptchaService behaviorCaptchaService;
    private final GraphicCaptchaService graphicCaptchaService;
    private final OptionService optionService;

    @Log(ignore = true)
    @Operation(summary = "获取行为验证码", description = "获取行为验证码（Base64编码）")
    @GetMapping("/behavior")
    public Object getBehaviorCaptcha(CaptchaVO captchaReq, HttpServletRequest request) {
        captchaReq.setBrowserInfo(JakartaServletUtil.getClientIP(request) + request.getHeader(HttpHeaders.USER_AGENT));
        ResponseModel responseModel = behaviorCaptchaService.get(captchaReq);
        CheckUtils.throwIf(() -> !StrUtil.equals(RepCodeEnum.SUCCESS.getCode(), responseModel
                                                 .getRepCode()), responseModel.getRepMsg());
        return responseModel.getRepData();
    }

    @Log(ignore = true)
    @Operation(summary = "校验行为验证码", description = "校验行为验证码")
    @PostMapping("/behavior")
    public Object checkBehaviorCaptcha(@RequestBody CaptchaVO captchaReq, HttpServletRequest request) {
        captchaReq.setBrowserInfo(JakartaServletUtil.getClientIP(request) + request.getHeader(HttpHeaders.USER_AGENT));
        return behaviorCaptchaService.check(captchaReq);
    }

    @Log(ignore = true)
    @Operation(summary = "获取图片验证码", description = "获取图片验证码（Base64编码，带图片格式：data:image/gif;base64）")
    @GetMapping("/image")
    public CaptchaResp getImageCaptcha() {
        String uuid = IdUtil.fastUUID();
        String captchaKey = CacheConstants.CAPTCHA_KEY_PREFIX + uuid;
        Captcha captcha = graphicCaptchaService.getCaptcha();
        long expireTime = LocalDateTimeUtil.toEpochMilli(LocalDateTime.now()
                                                         .plusMinutes(captchaProperties.getExpirationInMinutes()));
        RedisUtils.set(captchaKey, captcha.text(), Duration.ofMinutes(captchaProperties.getExpirationInMinutes()));
        return CaptchaResp.builder().uuid(uuid).img(captcha.toBase64()).expireTime(expireTime).build();
    }

    /**
     * 获取邮箱验证码
     *
     * <p>
     * 限流规则：<br>
     * 1.同一邮箱同一模板，1分钟2条，1小时8条，24小时20条 <br>
     * 2、同一邮箱所有模板 24 小时 100 条 <br>
     * 3、同一 IP 每分钟限制发送 30 条
     * </p>
     * 
     * @param email 邮箱
     * @return /
     */
    @Operation(summary = "获取邮箱验证码", description = "发送验证码到指定邮箱")
    @GetMapping("/mail")
    @RateLimiters({
        @RateLimiter(name = CacheConstants.CAPTCHA_KEY_PREFIX + "MIN", key = "#email + ':' + T(cn.hutool.extra.spring.SpringUtil).getProperty('captcha.mail.templatePath')", rate = 2, interval = 1, unit = RateIntervalUnit.MINUTES, message = "获取验证码操作太频繁，请稍后再试"),
        @RateLimiter(name = CacheConstants.CAPTCHA_KEY_PREFIX + "HOUR", key = "#email + ':' + T(cn.hutool.extra.spring.SpringUtil).getProperty('captcha.mail.templatePath')", rate = 8, interval = 1, unit = RateIntervalUnit.HOURS, message = "获取验证码操作太频繁，请稍后再试"),
        @RateLimiter(name = CacheConstants.CAPTCHA_KEY_PREFIX + "DAY'", key = "#email + ':' + T(cn.hutool.extra.spring.SpringUtil).getProperty('captcha.mail.templatePath')", rate = 20, interval = 24, unit = RateIntervalUnit.HOURS, message = "获取验证码操作太频繁，请稍后再试"),
        @RateLimiter(name = CacheConstants.CAPTCHA_KEY_PREFIX, key = "#email", rate = 100, interval = 24, unit = RateIntervalUnit.HOURS, message = "获取验证码操作太频繁，请稍后再试"),
        @RateLimiter(name = CacheConstants.CAPTCHA_KEY_PREFIX, key = "#email", rate = 30, interval = 1, unit = RateIntervalUnit.MINUTES, type = LimitType.IP, message = "获取验证码操作太频繁，请稍后再试")})
    public R getMailCaptcha(@NotBlank(message = "邮箱不能为空") @Pattern(regexp = RegexPool.EMAIL, message = "邮箱格式错误") String email) throws MessagingException {
        // 生成验证码
        CaptchaProperties.CaptchaMail captchaMail = captchaProperties.getMail();
        String captcha = RandomUtil.randomNumbers(captchaMail.getLength());
        // 发送验证码
        Long expirationInMinutes = captchaMail.getExpirationInMinutes();
        Map<String, String> siteConfig = optionService.getByCategory("SITE");
        String content = TemplateUtils.render(captchaMail.getTemplatePath(), Dict.create()
            .set("siteUrl", projectProperties.getUrl())
            .set("siteTitle", siteConfig.get("SITE_TITLE"))
            .set("siteCopyright", siteConfig.get("SITE_COPYRIGHT"))
            .set("captcha", captcha)
            .set("expiration", expirationInMinutes));
        MailUtils.sendHtml(email, "【%s】邮箱验证码".formatted(projectProperties.getName()), content);
        // 保存验证码
        String captchaKey = CacheConstants.CAPTCHA_KEY_PREFIX + email;
        RedisUtils.set(captchaKey, captcha, Duration.ofMinutes(expirationInMinutes));
        return R.ok("发送成功，验证码有效期 %s 分钟".formatted(expirationInMinutes));
    }

    /**
     * 获取短信验证码
     *
     * <p>
     * 限流规则：<br>
     * 1.同一号码同一模板，1分钟2条，1小时8条，24小时20条 <br>
     * 2、同一号码所有模板 24 小时 100 条 <br>
     * 3、同一 IP 每分钟限制发送 30 条
     * </p>
     * 
     * @param phone      手机号
     * @param captchaReq 行为验证码信息
     * @return /
     */
    @Operation(summary = "获取短信验证码", description = "发送验证码到指定手机号")
    @GetMapping("/sms")
    @RateLimiters({
        @RateLimiter(name = CacheConstants.CAPTCHA_KEY_PREFIX + "MIN", key = "#phone + ':' + T(cn.hutool.extra.spring.SpringUtil).getProperty('captcha.sms.templateId')", rate = 2, interval = 1, unit = RateIntervalUnit.MINUTES, message = "获取验证码操作太频繁，请稍后再试"),
        @RateLimiter(name = CacheConstants.CAPTCHA_KEY_PREFIX + "HOUR", key = "#phone + ':' + T(cn.hutool.extra.spring.SpringUtil).getProperty('captcha.sms.templateId')", rate = 8, interval = 1, unit = RateIntervalUnit.HOURS, message = "获取验证码操作太频繁，请稍后再试"),
        @RateLimiter(name = CacheConstants.CAPTCHA_KEY_PREFIX + "DAY'", key = "#phone + ':' + T(cn.hutool.extra.spring.SpringUtil).getProperty('captcha.sms.templateId')", rate = 20, interval = 24, unit = RateIntervalUnit.HOURS, message = "获取验证码操作太频繁，请稍后再试"),
        @RateLimiter(name = CacheConstants.CAPTCHA_KEY_PREFIX, key = "#phone", rate = 100, interval = 24, unit = RateIntervalUnit.HOURS, message = "获取验证码操作太频繁，请稍后再试"),
        @RateLimiter(name = CacheConstants.CAPTCHA_KEY_PREFIX, key = "#phone", rate = 30, interval = 1, unit = RateIntervalUnit.MINUTES, type = LimitType.IP, message = "获取验证码操作太频繁，请稍后再试")})
    public R getSmsCaptcha(@NotBlank(message = "手机号不能为空") @Pattern(regexp = RegexPool.MOBILE, message = "手机号格式错误") String phone,
                           CaptchaVO captchaReq) {
        // 行为验证码校验
        ResponseModel verificationRes = behaviorCaptchaService.verification(captchaReq);
        ValidationUtils.throwIfNotEqual(verificationRes.getRepCode(), RepCodeEnum.SUCCESS.getCode(), verificationRes
            .getRepMsg());
        CaptchaProperties.CaptchaSms captchaSms = captchaProperties.getSms();
        // 生成验证码
        String captcha = RandomUtil.randomNumbers(captchaSms.getLength());
        // 发送验证码
        Long expirationInMinutes = captchaSms.getExpirationInMinutes();
        SmsBlend smsBlend = SmsFactory.getBySupplier(SupplierConstant.CLOOPEN);
        Map<String, String> messageMap = MapUtil.newHashMap(2, true);
        messageMap.put("captcha", captcha);
        messageMap.put("expirationInMinutes", String.valueOf(expirationInMinutes));
        SmsResponse smsResponse = smsBlend.sendMessage(phone, captchaSms
            .getTemplateId(), (LinkedHashMap<String, String>)messageMap);
        CheckUtils.throwIf(!smsResponse.isSuccess(), "验证码发送失败");
        // 保存验证码
        String captchaKey = CacheConstants.CAPTCHA_KEY_PREFIX + phone;
        RedisUtils.set(captchaKey, captcha, Duration.ofMinutes(expirationInMinutes));
        return R.ok("发送成功，验证码有效期 %s 分钟".formatted(expirationInMinutes));
    }
}
```

这段代码是 `CaptchaController` 类中的一个方法，具体来说是处理获取短信验证码的请求。下面我们逐步分析这段代码的每个部分及其功能。

##### 方法签名
```java
@Operation(summary = "获取短信验证码", description = "发送验证码到指定手机号")
@GetMapping("/sms")
@RateLimiters({ ... })
public R getSmsCaptcha(@NotBlank(message = "手机号不能为空") 
                       @Pattern(regexp = RegexPool.MOBILE, message = "手机号格式错误") String phone,
                       CaptchaVO captchaReq) {
```

DiffCopyInsert

+ `@Operation`: 该注解用于描述 OpenAPI 文档中的操作。此处表示该方法的功能是 "获取短信验证码"。
+ `@GetMapping("/sms")`: 映射 GET 请求到 `/captcha/sms` 路径。
+ `@RateLimiters`: 该注解设置了对请求频率的限制规则，包括分钟、小时、天以及 IP 限制等，防止用户过于频繁地请求验证码。
+ `@NotBlank` 和 `@Pattern`: 在方法参数中对 `phone` 参数进行验证，确保其不为空且符合手机号的格式要求。
+ `public R getSmsCaptcha(...)`: 方法返回类型为 `R` （通常是一个标准响应封装），方法接受手机号和行为验证码请求对象 `captchaReq`。

##### 方法主体
```java
// 行为验证码校验
ResponseModel verificationRes = behaviorCaptchaService.verification(captchaReq);
ValidationUtils.throwIfNotEqual(verificationRes.getRepCode(), RepCodeEnum.SUCCESS.getCode(), verificationRes.getRepMsg());
```

DiffCopyInsert

+ 首先调用 `behaviorCaptchaService.verification` 方法来校验用户提供的行为验证码。
+ 使用 `ValidationUtils.throwIfNotEqual` 方法检查 `verificationRes` 的返回代码，若不等于预期的成功代码，则抛出异常并返回对应的错误信息。

##### 生成验证码
```java
CaptchaProperties.CaptchaSms captchaSms = captchaProperties.getSms();
// 生成验证码
String captcha = RandomUtil.randomNumbers(captchaSms.getLength());
```

DiffCopyInsert

+ 从 `captchaProperties` 获取短信验证码相关的配置。
+ 使用 `RandomUtil.randomNumbers` 方法生成一个指定长度的随机数字，作为短信验证码。

##### 发送验证码
```java
Long expirationInMinutes = captchaSms.getExpirationInMinutes();
SmsBlend smsBlend = SmsFactory.getBySupplier(SupplierConstant.CLOOPEN);
Map<String, String> messageMap = MapUtil.newHashMap(2, true);
messageMap.put("captcha", captcha);
messageMap.put("expirationInMinutes", String.valueOf(expirationInMinutes));
SmsResponse smsResponse = smsBlend.sendMessage(phone, captchaSms.getTemplateId(), (LinkedHashMap<String, String>)messageMap);
CheckUtils.throwIf(!smsResponse.isSuccess(), "验证码发送失败");
```

DiffCopyInsert

+ 获取验证码的有效期（以分钟为单位）。
+ 使用 `SmsFactory` 根据供应商信息获取 `SmsBlend` 实例，以便发送短信。
+ 创建一个消息映射，将生成的验证码和过期时间放入一个 `Map` 中，以便在发送短信时使用。
+ 调用 `smsBlend.sendMessage` 方法发送短信，传入目标手机号、模板 ID 和消息内容。
+ 检查 `smsResponse` 是否表示成功，若不成功则抛出“验证码发送失败”的异常。

##### 保存验证码
```java
// 保存验证码
String captchaKey = CacheConstants.CAPTCHA_KEY_PREFIX + phone;
RedisUtils.set(captchaKey, captcha, Duration.ofMinutes(expirationInMinutes));
```

DiffCopyInsert

+ 生成存储验证码的 Redis 键，通常会使用手机号作为关键标识。
+ 将生成的验证码和过期时间存储在 Redis 中，以便后续进行验证。

##### 返回结果
```java
return R.ok("发送成功，验证码有效期 %s 分钟".formatted(expirationInMinutes));
```

DiffCopyInsert

+ 返回一个成功的响应，包含验证码的有效时间。

##### 总结
这段代码实现了获取短信验证码的功能，进行了一系列必要的验证和操作，包括：

1. 确保手机号有效且已通过行为验证码验证。
2. 生成随机验证码并设置其有效期。
3. 调用短信服务发送验证码到用户手机。
4. 存储验证码以便后续验证。
5. 返回操作结果。

通过这些步骤，确保用户能够安全高效地获取短信验证码，同时防止滥用。

### ContiNewAdminApplication.java——启动器
```java
@Slf4j
@EnableFileStorage
@EnableMethodCache(basePackages = "top.continew.admin")
@EnableGlobalResponse
@EnableCrudRestController
@RestController
@SpringBootApplication
@RequiredArgsConstructor
public class ContiNewAdminApplication implements ApplicationRunner {

    private final ProjectProperties projectProperties;
    private final ServerProperties serverProperties;

    public static void main(String[] args) {
        SpringApplication.run(ContiNewAdminApplication.class, args);
    }

    @Hidden
    @SaIgnore
    @GetMapping("/")
    public R index() {
        return R.ok("%s service started successfully.".formatted(projectProperties.getName()), null);
    }

    @Override
    public void run(ApplicationArguments args) {
        String hostAddress = NetUtil.getLocalhostStr();
        Integer port = serverProperties.getPort();
        String contextPath = serverProperties.getServlet().getContextPath();
        String baseUrl = URLUtil.normalize("%s:%s%s".formatted(hostAddress, port, contextPath));
        log.info("----------------------------------------------");
        log.info("{} service started successfully.", projectProperties.getName());
        log.info("API 地址：{}", baseUrl);
        Knife4jProperties knife4jProperties = SpringUtil.getBean(Knife4jProperties.class);
        if (!knife4jProperties.isProduction()) {
            log.info("API 文档：{}/doc.html", baseUrl);
        }
        log.info("----------------------------------------------");
    }
}
```

1. **注解解释**：
    - `@Slf4j`: 引入 Lombok 的日志功能，使得类能使用 `log` 变量记录日志。
    - `@EnableFileStorage`: 启用文件存储功能。这个功能可能涉及到指定的文件存储配置。
    - `@EnableMethodCache(basePackages = "top.continew.admin")`: 启用方法缓存，指定哪些包下的方法可以被缓存，以提升性能。
    - `@EnableGlobalResponse`: 启用全局响应处理，这通常用于统一处理 REST API 的响应格式。
    - `@EnableCrudRestController`: 启用 CRUD（增删改查）操作的 REST 控制器，使得该类支持相关操作。
    - `@RestController`: 表明该类是一个 REST 控制器，其方法会返回 JSON 格式的响应。
    - `@SpringBootApplication`: 该注解综合了多个功能，开启了 Spring Boot 自动配置。
    - `@RequiredArgsConstructor`: 为类中所有 `final` 字段生成构造函数，便于依赖注入。
2. **成员变量**：
    - `private final ProjectProperties projectProperties;`: 用来存储项目的属性配置，通常是在配置文件中定义的。
    - `private final ServerProperties serverProperties;`: 存储服务器的属性配置，包括端口和上下文路径等。
3. **主方法**：

```java
public static void main(String[] args) {
    SpringApplication.run(ContiNewAdminApplication.class, args);
}
```

    - `SpringApplication.run(...)`: 启动 Spring Boot 应用程序。
4. **index 方法**：

```java
@Hidden
@SaIgnore
@GetMapping("/")
public R index() {
    return R.ok("%s service started successfully.".formatted(projectProperties.getName()), null);
}
```

    - `@GetMapping("/")`: 映射根路径的 GET 请求。
    - `R.ok(...)`: 返回一个成功的响应，包含服务启动成功的消息。
5. **run 方法**：

```java
@Override
public void run(ApplicationArguments args) {
    String hostAddress = NetUtil.getLocalhostStr();
    Integer port = serverProperties.getPort();
    String contextPath = serverProperties.getServlet().getContextPath();
    String baseUrl = URLUtil.normalize("%s:%s%s".formatted(hostAddress, port, contextPath));
    log.info("----------------------------------------------");
    log.info("{} service started successfully.", projectProperties.getName());
    log.info("API 地址：{}", baseUrl);
    Knife4jProperties knife4jProperties = SpringUtil.getBean(Knife4jProperties.class);
    if (!knife4jProperties.isProduction()) {
        log.info("API 文档：{}/doc.html", baseUrl);
    }
    log.info("----------------------------------------------");
}
```

    - 该方法在应用程序启动后执行，打印相关信息到日志中。
    - 获取主机地址、端口和上下文路径，构建 API 基础 URL。
    - 记录服务启动成功的日志信息。
    - 如果非生产环境，打印 API 文档的地址。

## 全局结果响应包装——来自continew-starter-web.jar
```java
@Schema(
    description = "响应信息"
)
public class R<T> implements Response {
    private static final GlobalResponseProperties PROPERTIES = (GlobalResponseProperties)SpringUtil.getBean(GlobalResponseProperties.class);
    private static final String DEFAULT_SUCCESS_CODE;
    private static final String DEFAULT_SUCCESS_MSG;
    private static final String DEFAULT_ERROR_CODE;
    private static final String DEFAULT_ERROR_MSG;
    @Schema(
        description = "状态码",
        example = "1"
    )
    private String code;
    @Schema(
        description = "状态信息",
        example = "ok"
    )
    private String msg;
    @Schema(
        description = "是否成功",
        example = "true"
    )
    private boolean success;
    @Schema(
        description = "时间戳",
        example = "1691453288000"
    )
    private final Long timestamp;
    @Schema(
        description = "响应数据"
    )
    private T data;

    public R() {
        this.timestamp = System.currentTimeMillis();
    }

    public R(String code, String msg) {
        this.timestamp = System.currentTimeMillis();
        this.setCode(code);
        this.setMsg(msg);
    }

    public R(String code, String msg, T data) {
        this(code, msg);
        this.data = data;
    }

    public void setStatus(ResponseStatus status) {
        this.setCode(status.getCode());
        this.setMsg(status.getMsg());
    }

    @JsonIgnore
    public ResponseStatus getStatus() {
        return null;
    }

    public void setPayload(Object payload) {
        this.data = payload;
    }

    @JsonIgnore
    public Object getPayload() {
        return null;
    }

    public String getCode() {
        return this.code;
    }

    public void setCode(String code) {
        this.code = code;
        this.success = DEFAULT_SUCCESS_CODE.equals(code);
    }

    public String getMsg() {
        return this.msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }

    public T getData() {
        return this.data;
    }

    public void setData(T data) {
        this.data = data;
    }

    public boolean isSuccess() {
        return this.success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public Long getTimestamp() {
        return this.timestamp;
    }

    public static R ok() {
        return new R(DEFAULT_SUCCESS_CODE, DEFAULT_SUCCESS_MSG);
    }

    public static R ok(Object data) {
        return new R(DEFAULT_SUCCESS_CODE, DEFAULT_SUCCESS_MSG, data);
    }

    public static R ok(String msg, Object data) {
        return new R(DEFAULT_SUCCESS_CODE, msg, data);
    }

    public static R fail() {
        return new R(DEFAULT_ERROR_CODE, DEFAULT_ERROR_MSG);
    }

    public static R fail(String code, String msg) {
        return new R(code, msg);
    }

    static {
        DEFAULT_SUCCESS_CODE = PROPERTIES.getDefaultSuccessCode();
        DEFAULT_SUCCESS_MSG = PROPERTIES.getDefaultSuccessMsg();
        DEFAULT_ERROR_CODE = PROPERTIES.getDefaultErrorCode();
        DEFAULT_ERROR_MSG = PROPERTIES.getDefaultErrorMsg();
    }
}
```

