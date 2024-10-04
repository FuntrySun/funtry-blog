# /config/log
## LogConfiguration.java——日志配置
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
## 解析
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

## LogDaoLocalImpl.java——日志持久层接口本地实现类
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

## 解析

### 类及其成员变量
```java
@RequiredArgsConstructor
public class LogDaoLocalImpl implements LogDao {
    private final UserService userService;
    private final LogMapper logMapper;
    private final TraceProperties traceProperties;
}
```


+ `@RequiredArgsConstructor`：这个注解将为所有 `final` 变量生成一个带参数的构造函数，允许在实例化 `LogDaoLocalImpl` 时传入这些依赖。
+ `UserService userService`、`LogMapper logMapper`、`TraceProperties traceProperties` 是类的成员变量，分别用于用户服务、日志数据库操作和追踪配置。

### 方法 `add(LogRecord logRecord)`
```java
@Async
@Override
public void add(LogRecord logRecord) {
    LogDO logDO = new LogDO();
```

+ `@Async`：这个注解表示该方法会异步执行，有助于提升性能，因为日志记录的过程可能不需要立即完成，可以在后台进行。
+ `LogDO logDO = new LogDO();`：创建一个新的 `LogDO` 实例，用于存储日志数据。

### 设置请求信息
```java
LogRequest logRequest = logRecord.getRequest();
this.setRequest(logDO, logRequest);
```


+ `LogRequest logRequest = logRecord.getRequest();`：从 `logRecord` 获取请求信息。
+ `this.setRequest(logDO, logRequest);`：调用 `setRequest` 方法，将请求信息填充到 `logDO` 对象中。

### 设置响应信息
```java
LogResponse logResponse = logRecord.getResponse();
this.setResponse(logDO, logResponse);
```


+ 获取响应信息并调用 `setResponse` 方法将其填充到 `logDO` 对象中。

### 设置基本信息
```java
logDO.setDescription(logRecord.getDescription());
logDO.setModule(StrUtils.blankToDefault(logRecord.getModule(), null, m -> m
    .replace("API", StringConstants.EMPTY)
    .trim()));
logDO.setTimeTaken(logRecord.getTimeTaken().toMillis());
logDO.setCreateTime(LocalDateTime.ofInstant(logRecord.getTimestamp(), ZoneId.systemDefault()));
```


+ 设置日志描述、模块（去掉字符串中的 "API"）、耗时（转换为毫秒）和创建时间（转换时区）。

### 设置操作人
```java
this.setCreateUser(logDO, logRequest, logResponse);
logMapper.insert(logDO);
```

+ 最后通过调用 `setCreateUser`方法填充操作人信息，并将 `logDO` 数据插入到数据库中。

### 私有方法 `setRequest(LogDO logDO, LogRequest logRequest)`
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


+ 此方法详细接收 `logRequest` 信息，设置到 `logDO` 中，涉及请求方法、URL、头信息、请求体、IP 地址、访问地址、浏览器类型和操作系统。
+ `StrUtil.subBefore(logRequest.getOs(), " or", false)` 是用来提取操作系统字符串中的主要部分，例如 "Windows 10 or Windows 11" 会被处理成 "Windows 10"。

### 私有方法 `setResponse(LogDO logDO, LogResponse logResponse)`
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


+ 设置响应信息，包括响应头、Trace ID、响应体和状态码。
+ 在此方法中，首先获取响应头信息并转换为 JSON 字符串，然后提取 Trace ID 和响应体。
+ 通过状态码判断操作是否成功并设置相应的状态，如果响应体不为空且不成功，则记录失败状态和错误信息。

### 私有方法 `setCreateUser(LogDO logDO, LogRequest logRequest, LogResponse logResponse)`
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


+ 该方法负责解析请求 URI 以确定用户的身份。
    - 如果是登出请求，从响应中提取用户信息。
    - 如果是登录请求，解析请求体中的登录信息并根据用户名查找用户 ID。
    - 对于其他请求，通过 Authorization 头获取 token，进一步提取用户 ID。

### 总结
`LogDaoLocalImpl` 类实现了日志记录的功能，主要包括：

1. **日志记录的持久化**：通过 `add` 方法将日志信息持久化到数据库。
2. **请求和响应的详细处理**：通过私有方法将请求和响应的信息细致地封装到日志对象中。
3. **用户信息的动态获取**：根据请求类型智能解析用户信息。
4. **异步操作**：使用 `@Async` 提升性能，使得日志记录不会阻塞请求处理流程。

该实现具有良好的扩展性和可维护性，适合在微服务架构或高并发环境下使用。