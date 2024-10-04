# common/config/mybatis
## BCryptEncryptor.java——加/解密处理器（不可逆）
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

## DataPermissionMapper.java——数据权限 Mapper 基类
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

## DefaultDataPermissionUserContextProvider.java——数据权限用户上下文提供者
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

## MybatisPlusConfiguration.java——myBatis-plus配置
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