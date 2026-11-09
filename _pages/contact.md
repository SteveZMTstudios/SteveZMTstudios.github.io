---
layout: default
title: "联系与商户信息"
nav_title: "联系"
description: "联系 SteveZMTstudios，查看商户信息、客服邮箱与许可确认所需资料。"
permalink: /contact/
---

{% include legal-nav.html %}

许可确认、订单、收据、退款或技术支持问题，请通过邮件联系。

## 客服邮箱

[{{ site.data.payment.email }}](mailto:{{ site.data.payment.email }})

通常会在 1–2 个工作日内回复。支持时间：周一至周五 10:00–18:00（UTC+8），节假日可能延迟。

## PGP 公钥

如果邮件涉及敏感信息，可以使用我的 PGP 公钥。

[查看公钥](https://key.stevezmt.top/)

## 商户信息

| 项目 | 信息 |
|---|---|
| 商户 | {{ site.data.payment.publicSellerName }} |
| 客服邮箱 | [{{ site.data.payment.email }}](mailto:{{ site.data.payment.email }}) |
| 客服电话 | {{ site.data.payment.phone }} |
| 网站 | [{{ site.data.payment.website }}]({{ site.data.payment.website }}) |
| 账单显示名称 | {{ site.data.payment.statementDescriptor }} |

> 详细注册地址、注册编号等商户信息与 Stripe 后台登记的商户信息保持一致。由于涉及注册地址，未在公开页面展示；提交 Stripe 争议或需要核验时，请以 Stripe 后台记录为准。本页只展示可公开的联系方式与经营地区。

## 许可确认时需要提供

- Stripe 收据或交易号；
- 项目名称与使用主体（个人或公司名称）；
- 需要的席位数量与使用场景；
- 希望获得的支持内容（次数、时长、范围）；
- 希望许可覆盖的项目与期限。

## 写信前

- 订单或退款：请附上付款邮箱、付款日期、金额以及 Stripe 收据或交易号。
- 技术支持：请说明项目名称、版本、运行环境、复现步骤和相关日志。
- 商业咨询：请描述使用场景、规模和预期时间线。

{% include legal-related.html current="contact" %}
