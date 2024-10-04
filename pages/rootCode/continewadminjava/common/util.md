# common/util
## SecureUtils.java——加密解密工具类
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
## 解析
#### 1. 类定义
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
