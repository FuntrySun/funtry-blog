import { defineConfig } from 'vitepress'
/**
 * 项目配置文件
 */
// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/funtry-blog/',
  title: "Funtry Blog 趣·尝",
  description: "Funtry Blog 一个学习有趣尝试的开端的博客",
    head: [
      ['link',{rel:'icon',href:'/favicon.ico'}],
    ],

  themeConfig: {
    // logo
    logo: "/Eggs.svg",
    //导航栏
    nav: [
      { text: '主页', link: '/' },
      { text: '前端', items: [
          { text: 'pinia封装', link: '/pages/html' },
          { text: 'TypeScript', link: '/pages/typescript' },
          { text: 'Vue3.0', link: '/pages/vue3' },
          { text: 'VitePress', link: '/pages/vitepress' }
        ] },
      {text:'后端',items:[
          {text:'Java',link:'/pages/java'},
          {text:'Spring',link:'/pages/spring'},
          {text:'Spring Boot',link:'/pages/springboot'},
          {text:'Mybatis',link:'/pages/mybatis'}
        ]},
      {text:'框架源码赏析',items:[
          {text:'Continew-admin-java',link:'/pages/rootCode/continewadminjava'},
          {text:'Continew-admin-ui',link:'/pages/springcloudalibaba'},
          {text:'SpringCloud Gateway',link:'/pages/springcloudgateway'},
          {text:'SpringCloud Sleuth',link:'/pages/springcloudsleuth'},
          {text:'SpringCloud Zuul',link:'/pages/springcloudzuul'},
      ]},
      {text:'关于我/联系',link:'/pages/about/about'}
    ],
    //侧边栏
    sidebar: [
      {
        text: '博客相关',
        items: [
          { text: '涵盖的内容', link: '/pages/introduce' },
          { text: '我想表达...', link: '/pages/price' }
        ]
      },
      {
        text:'前置知识-后端(Java)',
        link:'/pages/service',
        items:[
          {text:'Servlet',link:'/pages/pay'},
          {text:'微服务',items:[
              {text:'微服务',link:'/pages/pay'},
              {text:'微服务',link:'/pages/transfer'},
              {text:'微服务',link:'/pages/pay'}
          ]},
          {text:'分布式',items:[
              {text:'分布式',link:'/pages/pay'},
              {text:'分布式',link:'/pages/transfer'},
              {text:'分布式',link:'/pages/pay'}
          ]},
          {text:'OAuth2',link:'/pages/frontKnowledge/backend/oauth2'},
          {text:'单点登录',link:'/pages/transfer'},
          {text:'',link:'/pages/pay'}
        ]
      },
      {
        text:'前置知识-前端(Vue3)',
        link:'/pages/service',
        items:[
          {text:'商家端',link:'/pages/pay'},
          {text:'企业端',link:'/pages/transfer'},
          {text:'个人端',link:'/pages/pay'}
        ]
      },
      {
        text:'SpringBoot3',
        link:'/pages/service',
        items:[
          {text:'商家端',link:'/pages/pay'},
          {text:'企业端',link:'/pages/transfer'},
          {text:'个人端',link:'/pages/pay'}
        ]
      },
      {
        text:'SpringCloudAlibaba',
        link:'/pages/safe/safe',
        items:[
          {text:'商家端',link:'/pages/pay'},
          {text:'企业端',link:'/pages/transfer'},
          {text:'个人端',link:'/pages/pay'}
        ]
      },
      {
        text:'前后端框架源码赏析',
        link: '',
        items:[
          {text:'Continew-admin-java',collapsed: true,items:[
            {text:'continew-admin-common',collapsed: true,items:[
              {text:'common/config/exception异常处理',link:'/pages/rootCode/continewadminjava/common/exception'},
              {text:'common/config/mybatis持久层配置',link:'/pages/rootCode/continewadminjava/common/mybatis'},
              {text:'common/config/properties配置属性',link:'/pages/rootCode/continewadminjava/common/properties'},
              {text:'common/constant缓存常量',link:'/pages/rootCode/continewadminjava/common/constant'},
              {text:'common/enums枚举类',link:'/pages/rootCode/continewadminjava/common/enums'},
              {text:'common/model/Dto',link:'/pages/rootCode/continewadminjava/common/modeldto'},
              {text:'common/model/resp',link:'/pages/rootCode/continewadminjava/common/modelresp'},
              {text:'common/util/helper',link:'/pages/rootCode/continewadminjava/common/utilhelper'},
              {text:'common/util',link:'/pages/rootCode/continewadminjava/common/util'},
            ]},
            {text:'continew-admin-webapi',collapsed: true,items:[
              {text:'/config/log',link:'/pages/rootCode/continewadminjava/system/log'},
              {text:'/saToken',link:'/pages/rootCode/continewadminjava/system/satoken'},
              {text:'/controller/auth',link:'/pages/rootCode/continewadminjava/system/controllerAuth'},
              {text:'/controller/common',link:'/pages/rootCode/continewadminjava/system/controllerCommon'},
              {text:'ContiNewAdminApplication.java——启动器',link:'/pages/rootCode/continewadminjava/system/contiNewAdminApplication'}
            ]}
          ]},
        ]
      }
    ],
    //社交链接
    socialLinks: [
      { icon: 'discord', link: 'https://github.com/vuejs/vitepress' }
    ],

    //页脚
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2019-present Evan You'
    },
    // 全局搜索
    search:{
      provider:'local'
    },
    // 最后更新链接
    lastUpdated: {
      text: 'Updated at',
      formatOptions: {
        dateStyle: 'full',
        timeStyle: 'medium'
      }
    }
  }
})
