# 全局
## ContiNewAdminApplication.java——启动器
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
## 解析
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