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
        text: '平台相关',
        items: [
          { text: '小蚁是？', link: '/pages/introduce' },
          { text: '收费情况', link: '/pages/price' }
        ]
      },
      {
        text:'服务与产品',
        link:'/pages/service',
        items:[
          {text:'聚合支付',link:'/pages/pay'},
          {text:'聚合转账',link:'/pages/transfer'},
          {text:'聚合代付',link:'/pages/pay'}
        ]
      },
      {
        text:'收费标准及优惠政策',
        link:'/pages/service',
        items:[
          {text:'商家端',link:'/pages/pay'},
          {text:'企业端',link:'/pages/transfer'},
          {text:'个人端',link:'/pages/pay'}
        ]
      },
      {
        text:'客户案例',
        link:'/pages/service',
        items:[
          {text:'商家端',link:'/pages/pay'},
          {text:'企业端',link:'/pages/transfer'},
          {text:'个人端',link:'/pages/pay'}
        ]
      },
      {
        text:'安全与合规',
        link:'/pages/safe/safe',
        items:[
          {text:'商家端',link:'/pages/pay'},
          {text:'企业端',link:'/pages/transfer'},
          {text:'个人端',link:'/pages/pay'}
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
