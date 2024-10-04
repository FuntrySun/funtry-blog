# common/model/Dto
## LoginUser——登陆用户信息
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
1. **构造函数**

```java
public LoginUser(Set<String> permissions, Set<RoleDTO> roles, Integer passwordExpirationDays) {
    this.permissions = permissions;
    this.setRoles(roles);
    this.passwordExpirationDays = passwordExpirationDays;
}
```

- 这个构造函数用于创建 `LoginUser` 对象，并初始化用户的权限、角色和密码有效期。
1. **setter方法**

```java
public void setRoles(Set<RoleDTO> roles) {
    this.roles = roles;
    this.roleCodes = roles.stream().map(RoleDTO::getCode).collect(Collectors.toSet());
}
```


- 这个方法不仅设置角色集合，还根据角色集合提取角色编码并存储到 `roleCodes` 属性中。
1. **管理员判断方法**

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

## RoleDto——角色信息
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

