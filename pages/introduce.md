# 技术栈介绍
在这个博客中，我们将探索和分享多个技术栈，包括Vue3、Spring Boot和Spring Cloud。这些技术栈在现代软件开发中扮演着重要的角色，每个都有其独特的特点和用途。
## Vue3 🌟
Vue3是Vue.js的最新版本，是一个用于构建用户界面的渐进式JavaScript框架。它具有简洁的API、灵活的组件系统和强大的生态系统。Vue3引入了许多新特性和改进，如Composition API、Teleport、Fragments等，使得开发更加高效和灵活。
```typescript
<template>
  <div>
    <h1>{{ message }}</h1>
    <button @click="updateMessage">Update Message</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const message = ref('Hello, Vue3!');

function updateMessage() {
  message.value = 'Hello, Updated Vue3!';
}
</script>

```
标签：#Vue3 #前端 #JavaScript
## Spring Boot ⚡
Spring Boot是一个基于Spring框架的开源Java-based框架，用于创建独立的、生产级别的基于Spring的应用程序。它简化了Spring应用程序的初始搭建过程和开发工作，使得开发者能够快速启动和运行应用程序。Spring Boot提供了一种快捷的方式来构建和配置Spring应用程序，包括自动配置、嵌入式服务器和安全性等。
```java
@SpringBootApplication
public class MyApplication {
  public static void main(String[] args) {
    SpringApplication.run(MyApplication.class, args);
  }
}

```
标签：#SpringBoot #后端 #Java #微服务
## Spring Cloud ☁️
Spring Cloud是一套基于Spring Boot的开源微服务框架，用于快速、简单地构建分布式系统中的一些常见模式（例如配置管理、服务发现、断路器、智能路由、微代理、控制总线、一次性令牌、全局锁、领导选举、分布式会话和集群状态）。Spring Cloud提供了许多工具和库，帮助开发者构建和部署基于云的应用程序。
```java
@SpringBootApplication
@EnableConfigServer
public class ConfigServerApplication {
  public static void main(String[] args) {
    SpringApplication.run(ConfigServerApplication.class, args);
  }
}//使用了@EnableConfigServer注解来创建一个配置服务器。
//Spring Cloud还提供了许多其他强大的特性和组件，如Eureka、Hystrix、Zuul等

```
标签：#SpringCloud #微服务 #分布式系统 #云原生

## Pinia 🛍️
Pinia是一个轻量级的、符合Vue3 Composition API的状态管理库。它提供了Vue2和Vue3的状态管理解决方案，是Vuex的官方替代品。Pinia以其简单性、直观性和灵活性而受到开发者的喜爱。它允许你以最少的配置和代码来管理应用程序的状态。
```javascript
import { defineStore } from 'pinia';

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
  }),
  actions: {
    increment() {
      this.count++;
    },
  },
});

```
标签：#Pinia #状态管理 #Vue3
## Axios 🌐
Axios是一个基于Promise的HTTP客户端，用于浏览器和Node.js。它是一个强大的工具，用于处理HTTP请求，支持拦截请求和响应、转换请求数据和响应数据、取消请求、自动转换JSON数据等。Axios是现代JavaScript应用程序中处理API通信的流行选择。
```javascript
axios.get('https://api.example.com/data')
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error(error);
  });

```
标签：#Axios #HTTP #API #客户端
## TypeScript 🚀
TypeScript是一种由微软开发的自由和开源的编程语言，它是JavaScript的一个超集，添加了静态类型选项。TypeScript扩展了JavaScript的语法，任何现有的JavaScript程序都是合法的TypeScript程序。TypeScript提供了类型检查和接口等特性，使得大型的前端项目更加易于维护和扩展。
```typescript
function greet(name: string): string {
  return 'Hello, ' + name + '!';
}

const message = greet('TypeScript');
console.log(message);

```
标签：#TypeScript #静态类型 #编程语言 #JavaScript
## UnoCSS 🎨
UnoCSS是一个即时原子CSS引擎，它基于Utility-First的CSS理念，提供了一种高效的方式来编写和优化CSS。UnoCSS通过自动生成原子CSS类，减少了手动编写CSS的需要，提高了开发效率和性能。它是现代前端开发中的一个热门选择，特别是在构建快速和响应式Web应用程序时。
```css
<div class="p-4 bg-blue-500 text-white rounded-lg shadow-md">
  Hello, UnoCSS!
</div>
```
标签：#UnoCSS #原子CSS #Utility-First #CSS
