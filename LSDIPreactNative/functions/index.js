const functions = require("firebase-functions");
const admin = require("firebase-admin")
const nodemailer = require('nodemailer');

admin.initializeApp()

var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'lagoonlaundryplq@gmail.com',
        pass: 'tshojlqajxaqidqz'
    }
});

exports.sendEmail = functions.firestore
    .document('orders/{orderId}')
    .onCreate(async (snap, context) => {
        if (snap.data().customerEmail.length > 0) {
            const mailOptions = {
                from: `lagoonlaundryplq@gmail.com`,
                to: snap.data().customerEmail,
                subject: "Lagoon Laundry Invoice Number: " + snap.data().invoiceNumber,
                html: `<!doctype html><html ⚡4email data-css-strict><head><meta charset="utf-8"><style amp4email-boilerplate>body{visibility:hidden}</style><script async src="https://cdn.ampproject.org/v0.js"></script><style amp-custom>.es-desk-hidden {	display:none;	float:left;	overflow:hidden;	width:0;	max-height:0;	line-height:0;}body {	width:100%;	font-family:arial, "helvetica neue", helvetica, sans-serif;}table {	border-collapse:collapse;	border-spacing:0px;}table td, body, .es-wrapper {	padding:0;	Margin:0;}.es-content, .es-header, .es-footer {	table-layout:fixed;	width:100%;}p, hr {	Margin:0;}h1, h2, h3, h4, h5 {	Margin:0;	line-height:120%;	font-family:arial, "helvetica neue", helvetica, sans-serif;}.es-left {	float:left;}.es-right {	float:right;}.es-p5 {	padding:5px;}.es-p5t {	padding-top:5px;}.es-p5b {	padding-bottom:5px;}.es-p5l {	padding-left:5px;}.es-p5r {	padding-right:5px;}.es-p10 {	padding:10px;}.es-p10t {	padding-top:10px;}.es-p10b {	padding-bottom:10px;}.es-p10l {	padding-left:10px;}.es-p10r {	padding-right:10px;}.es-p15 {	padding:15px;}.es-p15t {	padding-top:15px;}.es-p15b {	padding-bottom:15px;}.es-p15l {	padding-left:15px;}.es-p15r {	padding-right:15px;}.es-p20 {	padding:20px;}.es-p20t {	padding-top:20px;}.es-p20b {	padding-bottom:20px;}.es-p20l {	padding-left:20px;}.es-p20r {	padding-right:20px;}.es-p25 {	padding:25px;}.es-p25t {	padding-top:25px;}.es-p25b {	padding-bottom:25px;}.es-p25l {	padding-left:25px;}.es-p25r {	padding-right:25px;}.es-p30 {	padding:30px;}.es-p30t {	padding-top:30px;}.es-p30b {	padding-bottom:30px;}.es-p30l {	padding-left:30px;}.es-p30r {	padding-right:30px;}.es-p35 {	padding:35px;}.es-p35t {	padding-top:35px;}.es-p35b {	padding-bottom:35px;}.es-p35l {	padding-left:35px;}.es-p35r {	padding-right:35px;}.es-p40 {	padding:40px;}.es-p40t {	padding-top:40px;}.es-p40b {	padding-bottom:40px;}.es-p40l {	padding-left:40px;}.es-p40r {	padding-right:40px;}.es-menu td {	border:0;}s {	text-decoration:line-through;}p, ul li, ol li {	font-family:arial, "helvetica neue", helvetica, sans-serif;	line-height:150%;}ul li, ol li {	Margin-bottom:15px;	margin-left:0;}a {	text-decoration:underline;}.es-menu td a {	text-decoration:none;	display:block;	font-family:arial, "helvetica neue", helvetica, sans-serif;}.es-menu amp-img, .es-button amp-img {	vertical-align:middle;}.es-wrapper {	width:100%;	height:100%;}.es-wrapper-color, .es-wrapper {	background-color:#FFFFFF;}.es-header {	background-color:transparent;}.es-header-body {	background-color:#FFFFFF;}.es-header-body p, .es-header-body ul li, .es-header-body ol li {	color:#666666;	font-size:14px;}.es-header-body a {	color:#926B4A;	font-size:14px;}.es-content-body {	background-color:#FFFFFF;}.es-content-body p, .es-content-body ul li, .es-content-body ol li {	color:#666666;	font-size:14px;}.es-content-body a {	color:#926B4A;	font-size:14px;}.es-footer {	background-color:#E3CDC1;}.es-footer-body {	background-color:#E3CDC1;}.es-footer-body p, .es-footer-body ul li, .es-footer-body ol li {	color:#666666;	font-size:14px;}.es-footer-body a {	color:#926B4A;	font-size:14px;}.es-infoblock, .es-infoblock p, .es-infoblock ul li, .es-infoblock ol li {	line-height:120%;	font-size:12px;	color:#CCCCCC;}.es-infoblock a {	font-size:12px;	color:#CCCCCC;}h1 {	font-size:30px;	font-style:normal;	font-weight:bold;	color:#333333;}h2 {	font-size:24px;	font-style:normal;	font-weight:bold;	color:#333333;}h3 {	font-size:20px;	font-style:normal;	font-weight:bold;	color:#333333;}.es-header-body h1 a, .es-content-body h1 a, .es-footer-body h1 a {	font-size:30px;}.es-header-body h2 a, .es-content-body h2 a, .es-footer-body h2 a {	font-size:24px;}.es-header-body h3 a, .es-content-body h3 a, .es-footer-body h3 a {	font-size:20px;}a.es-button, button.es-button {	padding:10px 20px 10px 20px;	display:inline-block;	background:#666666;	border-radius:30px;	font-size:18px;	font-family:arial, "helvetica neue", helvetica, sans-serif;	font-weight:normal;	font-style:normal;	line-height:120%;	color:#FFFFFF;	text-decoration:none;	width:auto;	text-align:center;}.es-button-border {	border-style:solid solid solid solid;	border-color:#2CB543 #2CB543 #2CB543 #2CB543;	background:#666666;	border-width:0px 0px 0px 0px;	display:inline-block;	border-radius:30px;	width:auto;}@media only screen and (max-width:600px) {p, ul li, ol li, a { line-height:150% } h1, h2, h3, h1 a, h2 a, h3 a { line-height:120% } h1 { font-size:30px; text-align:center } h2 { font-size:26px; text-align:center } h3 { font-size:20px; text-align:center } .es-header-body h1 a, .es-content-body h1 a, .es-footer-body h1 a { font-size:30px } .es-header-body h2 a, .es-content-body h2 a, .es-footer-body h2 a { font-size:26px } .es-header-body h3 a, .es-content-body h3 a, .es-footer-body h3 a { font-size:20px } .es-menu td a { font-size:12px } .es-header-body p, .es-header-body ul li, .es-header-body ol li, .es-header-body a { font-size:14px } .es-content-body p, .es-content-body ul li, .es-content-body ol li, .es-content-body a { font-size:14px } .es-footer-body p, .es-footer-body ul li, .es-footer-body ol li, .es-footer-body a { font-size:14px } .es-infoblock p, .es-infoblock ul li, .es-infoblock ol li, .es-infoblock a { font-size:12px } *[class="gmail-fix"] { display:none } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3 { text-align:center } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3 { text-align:right } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3 { text-align:left } .es-m-txt-r amp-img { float:right } .es-m-txt-c amp-img { margin:0 auto } .es-m-txt-l amp-img { float:left } .es-button-border { display:block } a.es-button, button.es-button { font-size:20px; display:block; border-left-width:0px; border-right-width:0px } .es-adaptive table, .es-left, .es-right { width:100% } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%; max-width:600px } .es-adapt-td { display:block; width:100% } .adapt-img { width:100%; height:auto } td.es-m-p0 { padding:0 } td.es-m-p0r { padding-right:0 } td.es-m-p0l { padding-left:0 } td.es-m-p0t { padding-top:0 } td.es-m-p0b { padding-bottom:0 } td.es-m-p20b { padding-bottom:20px } .es-mobile-hidden, .es-hidden { display:none } tr.es-desk-hidden, td.es-desk-hidden, table.es-desk-hidden { width:auto; overflow:visible; float:none; max-height:inherit; line-height:inherit } tr.es-desk-hidden { display:table-row } table.es-desk-hidden { display:table } td.es-desk-menu-hidden { display:table-cell } .es-menu td { width:1% } table.es-table-not-adapt, .esd-block-html table { width:auto } table.es-social { display:inline-block } table.es-social td { display:inline-block } td.es-m-p5 { padding:5px } td.es-m-p5t { padding-top:5px } td.es-m-p5b { padding-bottom:5px } td.es-m-p5r { padding-right:5px } td.es-m-p5l { padding-left:5px } td.es-m-p10 { padding:10px } td.es-m-p10t { padding-top:10px } td.es-m-p10b { padding-bottom:10px } td.es-m-p10r { padding-right:10px } td.es-m-p10l { padding-left:10px } td.es-m-p15 { padding:15px } td.es-m-p15t { padding-top:15px } td.es-m-p15b { padding-bottom:15px } td.es-m-p15r { padding-right:15px } td.es-m-p15l { padding-left:15px } td.es-m-p20 { padding:20px } td.es-m-p20t { padding-top:20px } td.es-m-p20r { padding-right:20px } td.es-m-p20l { padding-left:20px } td.es-m-p25 { padding:25px } td.es-m-p25t { padding-top:25px } td.es-m-p25b { padding-bottom:25px } td.es-m-p25r { padding-right:25px } td.es-m-p25l { padding-left:25px } td.es-m-p30 { padding:30px } td.es-m-p30t { padding-top:30px } td.es-m-p30b { padding-bottom:30px } td.es-m-p30r { padding-right:30px } td.es-m-p30l { padding-left:30px } td.es-m-p35 { padding:35px } td.es-m-p35t { padding-top:35px } td.es-m-p35b { padding-bottom:35px } td.es-m-p35r { padding-right:35px } td.es-m-p35l { padding-left:35px } td.es-m-p40 { padding:40px } td.es-m-p40t { padding-top:40px } td.es-m-p40b { padding-bottom:40px } td.es-m-p40r { padding-right:40px } td.es-m-p40l { padding-left:40px } .es-desk-hidden { display:table-row; width:auto; overflow:visible; max-height:inherit } }</style></head>
                <body><div class="es-wrapper-color"> <!--[if gte mso 9]><v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t"> <v:fill type="tile" color="#ffffff"></v:fill> </v:background><![endif]--><table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0"><tr><td valign="top"><table cellpadding="0" cellspacing="0" class="es-header" align="center"><tr><td align="center"><table bgcolor="#ffffff" class="es-header-body" align="center" cellpadding="0" cellspacing="0" width="600"><tr><td class="esdev-adapt-off es-p20" align="left"><table width="560" cellpadding="0" cellspacing="0" class="esdev-mso-table"><tr><td class="esdev-mso-td" valign="top"><table cellpadding="0" cellspacing="0" class="es-left" align="left"><tr><td width="415" class="es-m-p0r" valign="top" align="center"><table cellpadding="0" cellspacing="0" width="100%" role="presentation"><tr><td align="left" style="font-size: 0px"><a target="_blank" href="https://www.lagoonlaundry.com/"><amp-img src="https://mrqmsy.stripocdn.email/content/guids/46ed5904-b2f9-46ad-9e43-bc8d279810de/images/download.png" alt="Logo" style="display: block" width="120" title="Logo" height="120"></amp-img></a></td>
                </tr></table></td></tr></table></td><td width="20"></td><td class="esdev-mso-td" valign="top"><table cellpadding="0" cellspacing="0" align="right"><tr><td width="125" align="left"><table cellpadding="0" cellspacing="0" width="100%" role="presentation"><tr><td><table cellpadding="0" cellspacing="0" width="100%" class="es-menu" role="presentation"><tr class="images"><td align="center" valign="top" width="33.33%" class="es-p10t es-p10b es-p5r es-p5l" id="esd-menu-id-0"><a target="_blank" href="https://www.lagoonlaundry.com/"><amp-img src="https://mrqmsy.stripocdn.email/content/guids/CABINET_455a2507bd277c27cf7436f66c6b427c/images/95531620294283439.png" alt="Пункт1" title="Пункт1" width="20" height="20"></amp-img></a></td>
                <td align="center" valign="top" width="33.33%" class="es-p10t es-p10b es-p5r es-p5l" id="esd-menu-id-1"><a target="_blank" href="https://www.lagoonlaundry.com/"><amp-img src="https://mrqmsy.stripocdn.email/content/guids/CABINET_455a2507bd277c27cf7436f66c6b427c/images/86381620294283248.png" alt="Пункт2" title="Пункт2" width="20" height="20"></amp-img></a></td><td align="center" valign="top" width="33.33%" class="es-p10t es-p10b es-p5r es-p5l" id="esd-menu-id-2"><a target="_blank" href="https://www.lagoonlaundry.com/"><amp-img src="https://mrqmsy.stripocdn.email/content/guids/CABINET_455a2507bd277c27cf7436f66c6b427c/images/29961620294283034.png" alt="Пункт3" title="Пункт3" width="20" height="20"></amp-img></a></td></tr></table></td></tr></table></td></tr></table></td></tr></table></td>
                </tr><tr><td class="es-p20t es-p20r es-p20l" align="left"><table cellpadding="0" cellspacing="0" width="100%"><tr><td width="560" align="center" valign="top"><table cellpadding="0" cellspacing="0" width="100%" role="presentation"><tr><td align="center"><h1>Your order is being processed!</h1></td></tr></table></td></tr></table></td></tr></table></td></tr></table><table cellpadding="0" cellspacing="0" class="es-content" align="center"><tr><td align="center"><table bgcolor="#ffffff" class="es-content-body" align="center" cellpadding="0" cellspacing="0" width="600"><tr><td class="es-p20t es-p20r es-p20l" align="left"><table cellpadding="0" cellspacing="0" width="100%"><tr><td width="560" align="center" valign="top"><table cellpadding="0" cellspacing="0" width="100%" role="presentation"><tr><td align="center"><h2 style="line-height: 150%">ORDER # ${snap.data().invoiceNumber}</h2><p style="line-height: 150%">24/05/2021</p></td></tr></table></td>
                </tr></table></td></tr><tr><td class="es-p20r es-p20l" align="left"><table cellpadding="0" cellspacing="0" width="100%"><tr><td width="560" align="center" valign="top"><table cellpadding="0" cellspacing="0" width="100%" role="presentation"><tr><td align="center" class="es-p5t es-p5b" style="font-size:0"><table border="0" width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr><td style="border-bottom: 1px solid #a0937d;background: none;height: 1px;width: 100%;margin: 0px"></td></tr></table></td></tr></table></td></tr></table></td>
                </tr><tr><td class="es-p20r es-p20l esdev-adapt-off" align="left"><table width="560" cellpadding="0" cellspacing="0" class="esdev-mso-table"><tr><td class="esdev-mso-td" valign="top"><table cellpadding="0" cellspacing="0" class="es-left" align="left"><tr><td width="466" align="left"><table cellpadding="0" cellspacing="0" width="100%" role="presentation"><tr><td align="left"><p><b>Total&nbsp;</b></p></td></tr></table></td></tr></table></td><td width="20"></td><td class="esdev-mso-td" valign="top"><table cellpadding="0" cellspacing="0" class="es-right" align="right"><tr><td width="74" align="left"><table cellpadding="0" cellspacing="0" width="100%" role="presentation"><tr><td align="right"><p><strong>$ ${snap.data().totalPrice}</strong></p></td></tr></table></td></tr></table></td></tr></table></td></tr></table></td>
                </tr></table><table cellpadding="0" cellspacing="0" class="es-content" align="center"><tr><td align="center"><table bgcolor="#ffffff" class="es-content-body" align="center" cellpadding="0" cellspacing="0" width="600"><tr><td class="es-p30t es-p20r es-p20l" align="left"><table cellpadding="0" cellspacing="0" width="100%"><tr><td width="560" align="center" valign="top"><table cellpadding="0" cellspacing="0" width="100%" role="presentation"><tr><td align="center" class="es-p5t es-p5b" style="font-size:0"><table border="0" width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr><td style="border-bottom: 1px solid #999999;background: none;height: 1px;width: 100%;margin: 0px"></td></tr></table></td></tr><tr><td align="left" class="es-p5t es-p5b"><p>For everything else you want to know…</p></td></tr></table></td></tr></table></td>
                </tr><tr><td class="es-p20b es-p20r es-p20l es-m-p10r es-m-p10l" align="left"> <!--[if mso]><table width="560" cellpadding="0" cellspacing="0"><tr><td width="265" valign="top"><![endif]--><table cellpadding="0" cellspacing="0" align="left" class="es-left"><tr><td width="265" align="center" valign="top"><table cellpadding="0" cellspacing="0" width="100%" role="presentation"><tr><td align="center" class="es-p10t es-p10b"><span class="es-button-border" style="display: block"><a href="https://www.lagoonlaundry.com/" class="es-button" target="_blank" style="padding-left: 20px;padding-right: 20px;display: block">Delivery FAQ</a></span></td></tr><tr><td align="center" class="es-p10t es-p10b"><span class="es-button-border" style="display: block"><a href="https://www.lagoonlaundry.com/" class="es-button" target="_blank" style="padding-left: 20px;padding-right: 20px;display: block">Returns FAQ</a></span></td></tr></table></td>
                </tr></table> <!--[if mso]></td><td width="30"></td><td width="265" valign="top"><![endif]--><table cellpadding="0" cellspacing="0" class="es-right" align="right"><tr><td width="265" align="left"><table cellpadding="0" cellspacing="0" width="100%" role="presentation"><tr><td align="center" class="es-p10t es-p10b"><span class="es-button-border" style="display: block"><a href="https://www.lagoonlaundry.com/" class="es-button" target="_blank" style="padding-left: 20px;padding-right: 20px;display: block">Order FAQ</a></span></td></tr><tr><td align="center" class="es-p10t es-p10b"><span class="es-button-border" style="display: block"><a href="https://www.lagoonlaundry.com/" class="es-button" target="_blank" style="padding-left: 20px;padding-right: 20px;display: block">Visit Customer Care</a></span></td></tr></table></td></tr></table> <!--[if mso]></td></tr></table><![endif]--></td></tr></table></td>
                </tr></table><table cellpadding="0" cellspacing="0" class="es-content" align="center"><tr><td align="center" bgcolor="#fef8ed" style="background-color: #fef8ed"><table bgcolor="#fef8ed" class="es-content-body" align="center" cellpadding="0" cellspacing="0" width="600" style="background-color: #fef8ed"><tr><td class="es-p15t es-p15b es-p20r es-p20l es-m-p10r es-m-p10l" align="left"><table cellpadding="0" cellspacing="0" width="100%"><tr><td width="560" align="center" valign="top"><table cellpadding="0" cellspacing="0" width="100%" role="presentation"><tr><td><table cellpadding="0" cellspacing="0" width="100%" class="es-menu" role="presentation"><tr class="links-images-left"><td align="center" valign="top" width="33.33%" class="es-p10t es-p10b es-p5r es-p5l" id="esd-menu-id-0"><a target="_blank" href="https://www.lagoonlaundry.com/" style="color: #a0937d"><amp-img src="https://mrqmsy.stripocdn.email/content/guids/CABINET_455a2507bd277c27cf7436f66c6b427c/images/58991620296762845.png" alt="FREE DELIVERY" title="FREE DELIVERY" width="25" height="25" style="margin-right:15px"></amp-img>FREE DELIVERY</a></td>
                <td align="center" valign="top" width="33.33%" class="es-p10t es-p10b es-p5r es-p5l" style="border-left: 1px solid #a0937d" id="esd-menu-id-1"><a target="_blank" href="https://www.lagoonlaundry.com/" style="color: #a0937d"><amp-img src="https://mrqmsy.stripocdn.email/content/guids/CABINET_455a2507bd277c27cf7436f66c6b427c/images/55781620296763104.png" alt="HIGH QUALITY" title="HIGH QUALITY" width="25" height="25" style="margin-right:15px"></amp-img>HIGH QUALITY</a></td><td align="center" valign="top" width="33.33%" class="es-p10t es-p10b es-p5r es-p5l" style="border-left: 1px solid #a0937d" id="esd-menu-id-2"><a target="_blank" href="https://www.lagoonlaundry.com/" style="color: #a0937d"><amp-img src="https://mrqmsy.stripocdn.email/content/guids/CABINET_455a2507bd277c27cf7436f66c6b427c/images/88291620296763036.png" alt="BEST CHOICE" title="BEST CHOICE" width="25" height="25" style="margin-right:15px"></amp-img>BEST CHOICE</a></td></tr></table></td>
                </tr></table></td></tr></table></td></tr></table></td></tr></table><table cellpadding="0" cellspacing="0" class="es-footer" align="center"><tr><td align="center" bgcolor="#ffffff" style="background-color: #ffffff"><table class="es-footer-body" align="center" cellpadding="0" cellspacing="0" width="600" style="background-color: transparent"><tr><td class="es-p30t es-p30b es-p20r es-p20l" align="left"><table cellpadding="0" cellspacing="0" width="100%"><tr><td width="560" align="left"><table cellpadding="0" cellspacing="0" width="100%" role="presentation"><tr><td><table cellpadding="0" cellspacing="0" width="100%" class="es-menu" role="presentation"><tr class="links"><td align="center" valign="top" width="25%" class="es-p10t es-p10b es-p5r es-p5l" id="esd-menu-id-0" style="padding-bottom: 10px"><a target="_blank" href="https://www.lagoonlaundry.com/." style="color: #666666">About us</a></td>
                <td align="center" valign="top" width="25%" class="es-p10t es-p10b es-p5r es-p5l" id="esd-menu-id-1" style="padding-bottom: 10px"><a target="_blank" href="https://www.lagoonlaundry.com/." style="color: #666666">News</a></td><td align="center" valign="top" width="25%" class="es-p10t es-p10b es-p5r es-p5l" id="esd-menu-id-2" style="padding-bottom: 10px"><a target="_blank" href="https://www.lagoonlaundry.com/." style="color: #666666">Career</a></td><td align="center" valign="top" width="25%" class="es-p10t es-p10b es-p5r es-p5l" id="esd-menu-id-2" style="padding-bottom: 10px"><a target="_blank" href="https://www.lagoonlaundry.com/." style="color: #666666">The shops</a></td></tr></table></td>
                </tr><tr><td align="center" class="es-p10t es-p10b" style="font-size:0"><table cellpadding="0" cellspacing="0" class="es-table-not-adapt es-social" role="presentation"><tr><td align="center" valign="top" class="es-p20r"><a target="_blank" href="https://www.lagoonlaundry.com/"><amp-img title="Facebook" src="https://mrqmsy.stripocdn.email/content/assets/img/social-icons/logo-black/facebook-logo-black.png" alt="Fb" width="32" height="32"></amp-img></a></td><td align="center" valign="top" class="es-p20r"><a target="_blank" href="https://www.lagoonlaundry.com/"><amp-img title="Twitter" src="https://mrqmsy.stripocdn.email/content/assets/img/social-icons/logo-black/twitter-logo-black.png" alt="Tw" width="32" height="32"></amp-img></a></td>
                <td align="center" valign="top" class="es-p20r"><a target="_blank" href="https://www.lagoonlaundry.com/"><amp-img title="Instagram" src="https://mrqmsy.stripocdn.email/content/assets/img/social-icons/logo-black/instagram-logo-black.png" alt="Inst" width="32" height="32"></amp-img></a></td><td align="center" valign="top"><a target="_blank" href="https://www.lagoonlaundry.com/"><amp-img title="Youtube" src="https://mrqmsy.stripocdn.email/content/assets/img/social-icons/logo-black/youtube-logo-black.png" alt="Yt" width="32" height="32"></amp-img></a></td></tr></table></td>
                </tr><tr><td align="center" class="es-p10t es-p10b"><p style="font-size: 12px;color: #666666">You are receiving this email because you have visited our site or asked us about the regular newsletter. Make sure our messages get to your Inbox (and not your bulk or junk folders).<br><a target="_blank" style="font-size: 12px;color: #a0937d" href="https://www.lagoonlaundry.com/">Privacy policy</a> | <a target="_blank" style="font-size: 12px;color: #a0937d">Unsubscribe</a></p></td></tr></table></td></tr></table></td></tr></table></td></tr></table></td></tr></table></div></body></html>
                `
            };

            transporter.sendMail(mailOptions, (error, data) => {
                if (error) {
                    console.log(error)
                    return
                }
                console.log("Sent!")
            });
        } else {
            console.log("Customer is not member");
        }
    })

    
exports.sendEmailOnUserTimingsUpdate = functions.firestore
    .document('user_timings/{userId}')
    .onUpdate(async (change, context) => {
        console.log('change checked!');
        const db = admin.firestore();
        console.log('change checked1!');
        const userId = context.params.userId;
        console.log(userId);
        const previousSelectedTimes = change.before.data().selected_times;
        console.log('change checked3!');
        const updatedSelectedTimes = change.after.data().selected_times;
        console.log('change checked4!');

        // Find the new selected time(s) added to the selected_times array
        const newSelectedTimes = updatedSelectedTimes.filter((selectedTime) => {
            return !previousSelectedTimes.some((prevSelectedTime) => {
                return prevSelectedTime.date === selectedTime.date && prevSelectedTime.time === selectedTime.time;
            });
        });
        console.log('change checked5!');
        // If no new selected time(s) were added, return
        if (newSelectedTimes.length === 0) {
            console.log('change meiyou!');
            return;
        }
        console.log('change checked6!');
        // Get the customerNumber from the user document
        const userDoc = await db.collection('users').doc(userId).get();
        const customerNumber = userDoc.data().number;
        const customerEmail = userDoc.data().email;
        console.log(customerNumber);
        let deliveryFee = 0;
        // Send an email for each new selected time added
        const promises = newSelectedTimes.map(async (selectedTime) => {
            // Find the corresponding orders for the new selected time
            console.log('change checked7!');
            const orderNumbers = selectedTime.orders;
            console.log('change checked8!');
            console.log(orderNumbers);
            await db.collection('user_timings')
            .where(admin.firestore.FieldPath.documentId(), '==', userId)
             .get()
            .then((querySnapshot) => {
                if (!querySnapshot.empty) {
                    const doc = querySnapshot.docs[0];
                    const selectedTimeObj = doc.data().selected_times.find((timeObj) => {
                    return timeObj.date === selectedTime.date && timeObj.time === selectedTime.time;
                    });
                    deliveryFee = parseFloat(selectedTimeObj.deliveryFee);;
                    console.log(`Delivery Fee: ${deliveryFee}`);
                }
            })
            .catch((error) => {
            console.log(`Error getting selected times: ${error}`);
            return;
            });         
            const matchingOrdersQuery = await db.collection('orders')
            .where('customerNumber', '==', customerNumber)
            .where(admin.firestore.FieldPath.documentId(), 'in', orderNumbers)
            .get();

            const matchingOrders = matchingOrdersQuery.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                // const matchingOrders = await db.collection('orders')
                //     .where('customerNumber', '==', customerNumber)
                //     .where('orderNumber', 'in', orderNumbers)
                //     .get()
                //     .then(querySnapshot => {
                //         console.log('change checked9!');
                //         const matchingOrders = [];
                //         querySnapshot.forEach((doc) => {
                //             const order = doc.data();
                //             matchingOrders.push({ id: doc.id, ...doc.data() });
                //     //         // if (order.deliveryDate && order.deliveryDate.toDate().toDateString() === new Date(selectedTime.date).toDateString() && order.deliveryDate.toDate().toLocaleTimeString() === selectedTime.time) {
                //     //         //     matchingOrders.push({ id: doc.id, ...doc.data() });
                //     //         // }
                //         });
                //         console.log('change checked10!');
                //         return matchingOrders;
                //     });
                console.log(matchingOrders);
                // If there are no matching orders, return
                if (matchingOrders.length === 0) {
                    console.log('change checked11!');
                    return;
                }

                const orderItemPromises = matchingOrders.map(order => {
                    return Promise.all(order.orderItemIds.map(async orderItemId => {
                        const orderItemRef = db.collection('orderItem').doc(orderItemId);
                        const orderItemDoc = await orderItemRef.get();
                        //console.log(orderItemDoc);
                        const orderItemData = orderItemDoc.data();
                        console.log(orderItemData);
                        if(orderItemData == undefined){
                            return;
                        }
                        return `${orderItemData.typeOfServices}: ${orderItemData.laundryItemName}`;
                    }));
                });
                
                const orderItemDetails = await Promise.all(orderItemPromises).then(orderItemDetailsList => {
                    return orderItemDetailsList.map(orderItemDetails => {
                        return orderItemDetails.join('<br>');
                    });
                });
                
                const orderRows = matchingOrders.map((order, index) => {
                    return `
                        <tr>
                            <td>${order.id}</td>
                            <td>$${order.totalPrice.toFixed(2)}</td>
                            <td>${order.pickup ? `Selected Laundry Pickup: $${order.pickupCost.toFixed(2)}` :  'No Laundry Pickup'}</td>
                            <td>${orderItemDetails[index]}</td>
                        </tr>
                    `;
                }).join('');

                // Calculate total order price
                const totalOrderPrice = matchingOrders.reduce((total, order) => {
                    return total + order.totalPrice;
                }, 0);

                // Calculate total pickup cost
                const totalPickupCost = matchingOrders.reduce((total, order) => {
                    if (order.pickup) {
                        return total + order.pickupCost;
                    } else {
                        return total;
                    }
                }, 0);

                // Send an email to the customer with the matching orders
                //const customerEmail = change.after.data().email;
                //const customerEmail = 'wongjunwei17@gmail.com';
                console.log('change checked12!');
                const mailOptions = {
                    from: `lagoonlaundryplq@gmail.com`,
                    to: customerEmail,
                    subject: `Lagoon Laundry - Reciept for Delivery Slot Selected on ${selectedTime.date} ${selectedTime.time}`,
                    //html: `You have a new delivery slot selected on ${selectedTime.date} ${selectedTime.time}. Your matching orders are: ${matchingOrders}`
                    html: `
                    <html>
                    <head>
                        <title>Order Receipt</title>
                        <style>
                            body {
                                font-family: Arial, Helvetica, sans-serif;
                            }

                            h1, h2, h3 {
                                margin: 0;
                                padding: 0;
                            }

                            h1 {
                                font-size: 24px;
                                margin-bottom: 20px;
                            }

                            h2 {
                                font-size: 18px;
                                margin-bottom: 10px;
                            }

                            h3 {
                                font-size: 16px;
                                margin-bottom: 5px;
                            }

                            table {
                                width: 100%;
                                border-collapse: collapse;
                                margin-bottom: 20px;
                            }

                            th, td {
                                padding: 10px;
                                text-align: left;
                                border-bottom: 1px solid #ddd;
                            }

                            th {
                                background-color: #f2f2f2;
                            }

                            .total {
                                font-weight: bold;
                            }

                            .note {
                                font-style: italic;
                            }
                        </style>
                    </head>
                    <body>
                        <h1>Delivery Receipt</h1>
                        <h2>Delivery Slot Selected</h2>
                        <p>You have a new delivery slot selected on ${selectedTime.date} ${selectedTime.time}.</p>
                        <h2>Delivery Details</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Amount Due</th>
                                    <th>Laundry Pickup</th>
                                    <th>Order Items</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${orderRows}
                            </tbody>
                        </table>
                        <h2>Delivery Fee</h2>
                        <table>
                            <tbody>
                                <tr>
                                    <td>Delivery fee:</td>
                                    <td>$${(deliveryFee - totalOrderPrice - totalPickupCost).toFixed(2)}</td>
                                </tr>
                                <tr class="total">
                                    <td>Total Payment:</td>
                                    <td>$${deliveryFee.toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>
                        <p>Thank you for shopping at Lagoon Laundry. We hope you had an enjoyable experience with us!</p>
                    </body>
                    </html>

                    `
                };
                console.log('reached here!');
                return transporter.sendMail(mailOptions, (error, data) => {
                    if (error) {
                        console.log(error)
                        return
                    } else {
                        console.log('reached here2!');
                    }
                    console.log("Sent!")
                })
        });

        return Promise.all(promises);
    });

// exports.sendEmail = functions.firestore
//     .document('orders/{orderId}')
//     .onCreate(async (snap, context) => {
//         if (snap.data().customerEmail.length > 0) {
//             const mailOptions = {
//                 from: `lagoonlaundryplq@gmail.com`,
//                 to: snap.data().customerEmail,
//                 subject: "Lagoon Laundry Invoice Number: " + snap.data().invoiceNumber,
//                 html: `<!doctype html><html ⚡4email data-css-strict><head><meta charset="utf-8"><style amp4email-boilerplate>body{visibility:hidden}</style><script async src="https://cdn.ampproject.org/v0.js"></script><style amp-custom>.es-desk-hidden {	display:none;	float:left;	overflow:hidden;	width:0;	max-height:0;	line-height:0;}body {	width:100%;	font-family:arial, "helvetica neue", helvetica, sans-serif;}table {	border-collapse:collapse;	border-spacing:0px;}table td, body, .es-wrapper {	padding:0;	Margin:0;}.es-content, .es-header, .es-footer {	table-layout:fixed;	width:100%;}p, hr {	Margin:0;}h1, h2, h3, h4, h5 {	Margin:0;	line-height:120%;	font-family:arial, "helvetica neue", helvetica, sans-serif;}.es-left {	float:left;}.es-right {	float:right;}.es-p5 {	padding:5px;}.es-p5t {	padding-top:5px;}.es-p5b {	padding-bottom:5px;}.es-p5l {	padding-left:5px;}.es-p5r {	padding-right:5px;}.es-p10 {	padding:10px;}.es-p10t {	padding-top:10px;}.es-p10b {	padding-bottom:10px;}.es-p10l {	padding-left:10px;}.es-p10r {	padding-right:10px;}.es-p15 {	padding:15px;}.es-p15t {	padding-top:15px;}.es-p15b {	padding-bottom:15px;}.es-p15l {	padding-left:15px;}.es-p15r {	padding-right:15px;}.es-p20 {	padding:20px;}.es-p20t {	padding-top:20px;}.es-p20b {	padding-bottom:20px;}.es-p20l {	padding-left:20px;}.es-p20r {	padding-right:20px;}.es-p25 {	padding:25px;}.es-p25t {	padding-top:25px;}.es-p25b {	padding-bottom:25px;}.es-p25l {	padding-left:25px;}.es-p25r {	padding-right:25px;}.es-p30 {	padding:30px;}.es-p30t {	padding-top:30px;}.es-p30b {	padding-bottom:30px;}.es-p30l {	padding-left:30px;}.es-p30r {	padding-right:30px;}.es-p35 {	padding:35px;}.es-p35t {	padding-top:35px;}.es-p35b {	padding-bottom:35px;}.es-p35l {	padding-left:35px;}.es-p35r {	padding-right:35px;}.es-p40 {	padding:40px;}.es-p40t {	padding-top:40px;}.es-p40b {	padding-bottom:40px;}.es-p40l {	padding-left:40px;}.es-p40r {	padding-right:40px;}.es-menu td {	border:0;}s {	text-decoration:line-through;}p, ul li, ol li {	font-family:arial, "helvetica neue", helvetica, sans-serif;	line-height:150%;}ul li, ol li {	Margin-bottom:15px;	margin-left:0;}a {	text-decoration:underline;}.es-menu td a {	text-decoration:none;	display:block;	font-family:arial, "helvetica neue", helvetica, sans-serif;}.es-menu amp-img, .es-button amp-img {	vertical-align:middle;}.es-wrapper {	width:100%;	height:100%;}.es-wrapper-color, .es-wrapper {	background-color:#FFFFFF;}.es-header {	background-color:transparent;}.es-header-body {	background-color:#FFFFFF;}.es-header-body p, .es-header-body ul li, .es-header-body ol li {	color:#666666;	font-size:14px;}.es-header-body a {	color:#926B4A;	font-size:14px;}.es-content-body {	background-color:#FFFFFF;}.es-content-body p, .es-content-body ul li, .es-content-body ol li {	color:#666666;	font-size:14px;}.es-content-body a {	color:#926B4A;	font-size:14px;}.es-footer {	background-color:#E3CDC1;}.es-footer-body {	background-color:#E3CDC1;}.es-footer-body p, .es-footer-body ul li, .es-footer-body ol li {	color:#666666;	font-size:14px;}.es-footer-body a {	color:#926B4A;	font-size:14px;}.es-infoblock, .es-infoblock p, .es-infoblock ul li, .es-infoblock ol li {	line-height:120%;	font-size:12px;	color:#CCCCCC;}.es-infoblock a {	font-size:12px;	color:#CCCCCC;}h1 {	font-size:30px;	font-style:normal;	font-weight:bold;	color:#333333;}h2 {	font-size:24px;	font-style:normal;	font-weight:bold;	color:#333333;}h3 {	font-size:20px;	font-style:normal;	font-weight:bold;	color:#333333;}.es-header-body h1 a, .es-content-body h1 a, .es-footer-body h1 a {	font-size:30px;}.es-header-body h2 a, .es-content-body h2 a, .es-footer-body h2 a {	font-size:24px;}.es-header-body h3 a, .es-content-body h3 a, .es-footer-body h3 a {	font-size:20px;}a.es-button, button.es-button {	padding:10px 20px 10px 20px;	display:inline-block;	background:#666666;	border-radius:30px;	font-size:18px;	font-family:arial, "helvetica neue", helvetica, sans-serif;	font-weight:normal;	font-style:normal;	line-height:120%;	color:#FFFFFF;	text-decoration:none;	width:auto;	text-align:center;}.es-button-border {	border-style:solid solid solid solid;	border-color:#2CB543 #2CB543 #2CB543 #2CB543;	background:#666666;	border-width:0px 0px 0px 0px;	display:inline-block;	border-radius:30px;	width:auto;}@media only screen and (max-width:600px) {p, ul li, ol li, a { line-height:150% } h1, h2, h3, h1 a, h2 a, h3 a { line-height:120% } h1 { font-size:30px; text-align:center } h2 { font-size:26px; text-align:center } h3 { font-size:20px; text-align:center } .es-header-body h1 a, .es-content-body h1 a, .es-footer-body h1 a { font-size:30px } .es-header-body h2 a, .es-content-body h2 a, .es-footer-body h2 a { font-size:26px } .es-header-body h3 a, .es-content-body h3 a, .es-footer-body h3 a { font-size:20px } .es-menu td a { font-size:12px } .es-header-body p, .es-header-body ul li, .es-header-body ol li, .es-header-body a { font-size:14px } .es-content-body p, .es-content-body ul li, .es-content-body ol li, .es-content-body a { font-size:14px } .es-footer-body p, .es-footer-body ul li, .es-footer-body ol li, .es-footer-body a { font-size:14px } .es-infoblock p, .es-infoblock ul li, .es-infoblock ol li, .es-infoblock a { font-size:12px } *[class="gmail-fix"] { display:none } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3 { text-align:center } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3 { text-align:right } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3 { text-align:left } .es-m-txt-r amp-img { float:right } .es-m-txt-c amp-img { margin:0 auto } .es-m-txt-l amp-img { float:left } .es-button-border { display:block } a.es-button, button.es-button { font-size:20px; display:block; border-left-width:0px; border-right-width:0px } .es-adaptive table, .es-left, .es-right { width:100% } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%; max-width:600px } .es-adapt-td { display:block; width:100% } .adapt-img { width:100%; height:auto } td.es-m-p0 { padding:0 } td.es-m-p0r { padding-right:0 } td.es-m-p0l { padding-left:0 } td.es-m-p0t { padding-top:0 } td.es-m-p0b { padding-bottom:0 } td.es-m-p20b { padding-bottom:20px } .es-mobile-hidden, .es-hidden { display:none } tr.es-desk-hidden, td.es-desk-hidden, table.es-desk-hidden { width:auto; overflow:visible; float:none; max-height:inherit; line-height:inherit } tr.es-desk-hidden { display:table-row } table.es-desk-hidden { display:table } td.es-desk-menu-hidden { display:table-cell } .es-menu td { width:1% } table.es-table-not-adapt, .esd-block-html table { width:auto } table.es-social { display:inline-block } table.es-social td { display:inline-block } td.es-m-p5 { padding:5px } td.es-m-p5t { padding-top:5px } td.es-m-p5b { padding-bottom:5px } td.es-m-p5r { padding-right:5px } td.es-m-p5l { padding-left:5px } td.es-m-p10 { padding:10px } td.es-m-p10t { padding-top:10px } td.es-m-p10b { padding-bottom:10px } td.es-m-p10r { padding-right:10px } td.es-m-p10l { padding-left:10px } td.es-m-p15 { padding:15px } td.es-m-p15t { padding-top:15px } td.es-m-p15b { padding-bottom:15px } td.es-m-p15r { padding-right:15px } td.es-m-p15l { padding-left:15px } td.es-m-p20 { padding:20px } td.es-m-p20t { padding-top:20px } td.es-m-p20r { padding-right:20px } td.es-m-p20l { padding-left:20px } td.es-m-p25 { padding:25px } td.es-m-p25t { padding-top:25px } td.es-m-p25b { padding-bottom:25px } td.es-m-p25r { padding-right:25px } td.es-m-p25l { padding-left:25px } td.es-m-p30 { padding:30px } td.es-m-p30t { padding-top:30px } td.es-m-p30b { padding-bottom:30px } td.es-m-p30r { padding-right:30px } td.es-m-p30l { padding-left:30px } td.es-m-p35 { padding:35px } td.es-m-p35t { padding-top:35px } td.es-m-p35b { padding-bottom:35px } td.es-m-p35r { padding-right:35px } td.es-m-p35l { padding-left:35px } td.es-m-p40 { padding:40px } td.es-m-p40t { padding-top:40px } td.es-m-p40b { padding-bottom:40px } td.es-m-p40r { padding-right:40px } td.es-m-p40l { padding-left:40px } .es-desk-hidden { display:table-row; width:auto; overflow:visible; max-height:inherit } }</style></head>
//                 <body><div class="es-wrapper-color"> <!--[if gte mso 9]><v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t"> <v:fill type="tile" color="#ffffff"></v:fill> </v:background><![endif]--><table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0"><tr><td valign="top"><table cellpadding="0" cellspacing="0" class="es-header" align="center"><tr><td align="center"><table bgcolor="#ffffff" class="es-header-body" align="center" cellpadding="0" cellspacing="0" width="600"><tr><td class="esdev-adapt-off es-p20" align="left"><table width="560" cellpadding="0" cellspacing="0" class="esdev-mso-table"><tr><td class="esdev-mso-td" valign="top"><table cellpadding="0" cellspacing="0" class="es-left" align="left"><tr><td width="415" class="es-m-p0r" valign="top" align="center"><table cellpadding="0" cellspacing="0" width="100%" role="presentation"><tr><td align="left" style="font-size: 0px"><a target="_blank" href="https://www.lagoonlaundry.com/"><amp-img src="https://mrqmsy.stripocdn.email/content/guids/46ed5904-b2f9-46ad-9e43-bc8d279810de/images/download.png" alt="Logo" style="display: block" width="120" title="Logo" height="120"></amp-img></a></td>
//                 </tr></table></td></tr></table></td><td width="20"></td><td class="esdev-mso-td" valign="top"><table cellpadding="0" cellspacing="0" align="right"><tr><td width="125" align="left"><table cellpadding="0" cellspacing="0" width="100%" role="presentation"><tr><td><table cellpadding="0" cellspacing="0" width="100%" class="es-menu" role="presentation"><tr class="images"><td align="center" valign="top" width="33.33%" class="es-p10t es-p10b es-p5r es-p5l" id="esd-menu-id-0"><a target="_blank" href="https://www.lagoonlaundry.com/"><amp-img src="https://mrqmsy.stripocdn.email/content/guids/CABINET_455a2507bd277c27cf7436f66c6b427c/images/95531620294283439.png" alt="Пункт1" title="Пункт1" width="20" height="20"></amp-img></a></td>
//                 <td align="center" valign="top" width="33.33%" class="es-p10t es-p10b es-p5r es-p5l" id="esd-menu-id-1"><a target="_blank" href="https://www.lagoonlaundry.com/"><amp-img src="https://mrqmsy.stripocdn.email/content/guids/CABINET_455a2507bd277c27cf7436f66c6b427c/images/86381620294283248.png" alt="Пункт2" title="Пункт2" width="20" height="20"></amp-img></a></td><td align="center" valign="top" width="33.33%" class="es-p10t es-p10b es-p5r es-p5l" id="esd-menu-id-2"><a target="_blank" href="https://www.lagoonlaundry.com/"><amp-img src="https://mrqmsy.stripocdn.email/content/guids/CABINET_455a2507bd277c27cf7436f66c6b427c/images/29961620294283034.png" alt="Пункт3" title="Пункт3" width="20" height="20"></amp-img></a></td></tr></table></td></tr></table></td></tr></table></td></tr></table></td>
//                 </tr><tr><td class="es-p20t es-p20r es-p20l" align="left"><table cellpadding="0" cellspacing="0" width="100%"><tr><td width="560" align="center" valign="top"><table cellpadding="0" cellspacing="0" width="100%" role="presentation"><tr><td align="center"><h1>Your order is being processed!</h1></td></tr></table></td></tr></table></td></tr></table></td></tr></table><table cellpadding="0" cellspacing="0" class="es-content" align="center"><tr><td align="center"><table bgcolor="#ffffff" class="es-content-body" align="center" cellpadding="0" cellspacing="0" width="600"><tr><td class="es-p20t es-p20r es-p20l" align="left"><table cellpadding="0" cellspacing="0" width="100%"><tr><td width="560" align="center" valign="top"><table cellpadding="0" cellspacing="0" width="100%" role="presentation"><tr><td align="center"><h2 style="line-height: 150%">ORDER # ${snap.data().invoiceNumber}</h2><p style="line-height: 150%">24/05/2021</p></td></tr></table></td>
//                 </tr></table></td></tr><tr><td class="es-p20r es-p20l" align="left"><table cellpadding="0" cellspacing="0" width="100%"><tr><td width="560" align="center" valign="top"><table cellpadding="0" cellspacing="0" width="100%" role="presentation"><tr><td align="center" class="es-p5t es-p5b" style="font-size:0"><table border="0" width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr><td style="border-bottom: 1px solid #a0937d;background: none;height: 1px;width: 100%;margin: 0px"></td></tr></table></td></tr></table></td></tr></table></td>
//                 </tr><tr><td class="es-p20r es-p20l esdev-adapt-off" align="left"><table width="560" cellpadding="0" cellspacing="0" class="esdev-mso-table"><tr><td class="esdev-mso-td" valign="top"><table cellpadding="0" cellspacing="0" class="es-left" align="left"><tr><td width="466" align="left"><table cellpadding="0" cellspacing="0" width="100%" role="presentation"><tr><td align="left"><p><b>Total&nbsp;</b></p></td></tr></table></td></tr></table></td><td width="20"></td><td class="esdev-mso-td" valign="top"><table cellpadding="0" cellspacing="0" class="es-right" align="right"><tr><td width="74" align="left"><table cellpadding="0" cellspacing="0" width="100%" role="presentation"><tr><td align="right"><p><strong>$ ${snap.data().totalPrice}</strong></p></td></tr></table></td></tr></table></td></tr></table></td></tr></table></td>
//                 </tr></table><table cellpadding="0" cellspacing="0" class="es-content" align="center"><tr><td align="center"><table bgcolor="#ffffff" class="es-content-body" align="center" cellpadding="0" cellspacing="0" width="600"><tr><td class="es-p30t es-p20r es-p20l" align="left"><table cellpadding="0" cellspacing="0" width="100%"><tr><td width="560" align="center" valign="top"><table cellpadding="0" cellspacing="0" width="100%" role="presentation"><tr><td align="center" class="es-p5t es-p5b" style="font-size:0"><table border="0" width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr><td style="border-bottom: 1px solid #999999;background: none;height: 1px;width: 100%;margin: 0px"></td></tr></table></td></tr><tr><td align="left" class="es-p5t es-p5b"><p>For everything else you want to know…</p></td></tr></table></td></tr></table></td>
//                 </tr><tr><td class="es-p20b es-p20r es-p20l es-m-p10r es-m-p10l" align="left"> <!--[if mso]><table width="560" cellpadding="0" cellspacing="0"><tr><td width="265" valign="top"><![endif]--><table cellpadding="0" cellspacing="0" align="left" class="es-left"><tr><td width="265" align="center" valign="top"><table cellpadding="0" cellspacing="0" width="100%" role="presentation"><tr><td align="center" class="es-p10t es-p10b"><span class="es-button-border" style="display: block"><a href="https://www.lagoonlaundry.com/" class="es-button" target="_blank" style="padding-left: 20px;padding-right: 20px;display: block">Delivery FAQ</a></span></td></tr><tr><td align="center" class="es-p10t es-p10b"><span class="es-button-border" style="display: block"><a href="https://www.lagoonlaundry.com/" class="es-button" target="_blank" style="padding-left: 20px;padding-right: 20px;display: block">Returns FAQ</a></span></td></tr></table></td>
//                 </tr></table> <!--[if mso]></td><td width="30"></td><td width="265" valign="top"><![endif]--><table cellpadding="0" cellspacing="0" class="es-right" align="right"><tr><td width="265" align="left"><table cellpadding="0" cellspacing="0" width="100%" role="presentation"><tr><td align="center" class="es-p10t es-p10b"><span class="es-button-border" style="display: block"><a href="https://www.lagoonlaundry.com/" class="es-button" target="_blank" style="padding-left: 20px;padding-right: 20px;display: block">Order FAQ</a></span></td></tr><tr><td align="center" class="es-p10t es-p10b"><span class="es-button-border" style="display: block"><a href="https://www.lagoonlaundry.com/" class="es-button" target="_blank" style="padding-left: 20px;padding-right: 20px;display: block">Visit Customer Care</a></span></td></tr></table></td></tr></table> <!--[if mso]></td></tr></table><![endif]--></td></tr></table></td>
//                 </tr></table><table cellpadding="0" cellspacing="0" class="es-content" align="center"><tr><td align="center" bgcolor="#fef8ed" style="background-color: #fef8ed"><table bgcolor="#fef8ed" class="es-content-body" align="center" cellpadding="0" cellspacing="0" width="600" style="background-color: #fef8ed"><tr><td class="es-p15t es-p15b es-p20r es-p20l es-m-p10r es-m-p10l" align="left"><table cellpadding="0" cellspacing="0" width="100%"><tr><td width="560" align="center" valign="top"><table cellpadding="0" cellspacing="0" width="100%" role="presentation"><tr><td><table cellpadding="0" cellspacing="0" width="100%" class="es-menu" role="presentation"><tr class="links-images-left"><td align="center" valign="top" width="33.33%" class="es-p10t es-p10b es-p5r es-p5l" id="esd-menu-id-0"><a target="_blank" href="https://www.lagoonlaundry.com/" style="color: #a0937d"><amp-img src="https://mrqmsy.stripocdn.email/content/guids/CABINET_455a2507bd277c27cf7436f66c6b427c/images/58991620296762845.png" alt="FREE DELIVERY" title="FREE DELIVERY" width="25" height="25" style="margin-right:15px"></amp-img>FREE DELIVERY</a></td>
//                 <td align="center" valign="top" width="33.33%" class="es-p10t es-p10b es-p5r es-p5l" style="border-left: 1px solid #a0937d" id="esd-menu-id-1"><a target="_blank" href="https://www.lagoonlaundry.com/" style="color: #a0937d"><amp-img src="https://mrqmsy.stripocdn.email/content/guids/CABINET_455a2507bd277c27cf7436f66c6b427c/images/55781620296763104.png" alt="HIGH QUALITY" title="HIGH QUALITY" width="25" height="25" style="margin-right:15px"></amp-img>HIGH QUALITY</a></td><td align="center" valign="top" width="33.33%" class="es-p10t es-p10b es-p5r es-p5l" style="border-left: 1px solid #a0937d" id="esd-menu-id-2"><a target="_blank" href="https://www.lagoonlaundry.com/" style="color: #a0937d"><amp-img src="https://mrqmsy.stripocdn.email/content/guids/CABINET_455a2507bd277c27cf7436f66c6b427c/images/88291620296763036.png" alt="BEST CHOICE" title="BEST CHOICE" width="25" height="25" style="margin-right:15px"></amp-img>BEST CHOICE</a></td></tr></table></td>
//                 </tr></table></td></tr></table></td></tr></table></td></tr></table><table cellpadding="0" cellspacing="0" class="es-footer" align="center"><tr><td align="center" bgcolor="#ffffff" style="background-color: #ffffff"><table class="es-footer-body" align="center" cellpadding="0" cellspacing="0" width="600" style="background-color: transparent"><tr><td class="es-p30t es-p30b es-p20r es-p20l" align="left"><table cellpadding="0" cellspacing="0" width="100%"><tr><td width="560" align="left"><table cellpadding="0" cellspacing="0" width="100%" role="presentation"><tr><td><table cellpadding="0" cellspacing="0" width="100%" class="es-menu" role="presentation"><tr class="links"><td align="center" valign="top" width="25%" class="es-p10t es-p10b es-p5r es-p5l" id="esd-menu-id-0" style="padding-bottom: 10px"><a target="_blank" href="https://www.lagoonlaundry.com/." style="color: #666666">About us</a></td>
//                 <td align="center" valign="top" width="25%" class="es-p10t es-p10b es-p5r es-p5l" id="esd-menu-id-1" style="padding-bottom: 10px"><a target="_blank" href="https://www.lagoonlaundry.com/." style="color: #666666">News</a></td><td align="center" valign="top" width="25%" class="es-p10t es-p10b es-p5r es-p5l" id="esd-menu-id-2" style="padding-bottom: 10px"><a target="_blank" href="https://www.lagoonlaundry.com/." style="color: #666666">Career</a></td><td align="center" valign="top" width="25%" class="es-p10t es-p10b es-p5r es-p5l" id="esd-menu-id-2" style="padding-bottom: 10px"><a target="_blank" href="https://www.lagoonlaundry.com/." style="color: #666666">The shops</a></td></tr></table></td>
//                 </tr><tr><td align="center" class="es-p10t es-p10b" style="font-size:0"><table cellpadding="0" cellspacing="0" class="es-table-not-adapt es-social" role="presentation"><tr><td align="center" valign="top" class="es-p20r"><a target="_blank" href="https://www.lagoonlaundry.com/"><amp-img title="Facebook" src="https://mrqmsy.stripocdn.email/content/assets/img/social-icons/logo-black/facebook-logo-black.png" alt="Fb" width="32" height="32"></amp-img></a></td><td align="center" valign="top" class="es-p20r"><a target="_blank" href="https://www.lagoonlaundry.com/"><amp-img title="Twitter" src="https://mrqmsy.stripocdn.email/content/assets/img/social-icons/logo-black/twitter-logo-black.png" alt="Tw" width="32" height="32"></amp-img></a></td>
//                 <td align="center" valign="top" class="es-p20r"><a target="_blank" href="https://www.lagoonlaundry.com/"><amp-img title="Instagram" src="https://mrqmsy.stripocdn.email/content/assets/img/social-icons/logo-black/instagram-logo-black.png" alt="Inst" width="32" height="32"></amp-img></a></td><td align="center" valign="top"><a target="_blank" href="https://www.lagoonlaundry.com/"><amp-img title="Youtube" src="https://mrqmsy.stripocdn.email/content/assets/img/social-icons/logo-black/youtube-logo-black.png" alt="Yt" width="32" height="32"></amp-img></a></td></tr></table></td>
//                 </tr><tr><td align="center" class="es-p10t es-p10b"><p style="font-size: 12px;color: #666666">You are receiving this email because you have visited our site or asked us about the regular newsletter. Make sure our messages get to your Inbox (and not your bulk or junk folders).<br><a target="_blank" style="font-size: 12px;color: #a0937d" href="https://www.lagoonlaundry.com/">Privacy policy</a> | <a target="_blank" style="font-size: 12px;color: #a0937d">Unsubscribe</a></p></td></tr></table></td></tr></table></td></tr></table></td></tr></table></td></tr></table></div></body></html>
//                 `
//             };

//             transporter.sendMail(mailOptions, (error, data) => {
//                 if (error) {
//                     console.log(error)
//                     return
//                 }
//                 console.log("Sent!")
//             });
//         } else {
//             console.log("Customer is not member");
//         }
//     })
{/* <table>
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Amount Due</th>
                                    <th>Laundry Pickup</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${matchingOrders.map(order => `
                                        <tr>
                                            <td>${order.id}</td>
                                            <td>$${order.totalPrice.toFixed(2)}</td>
                                            <td>${order.pickup ? `Selected Laundry Pickup: $${order.pickupCost.toFixed(2)}` : (order.pickupCost ? 'No Laundry Pickup' : '')}</td>
                                        </tr>
                                    `).join('')}
                            </tbody>
                        </table>
                        <h2>Delivery Fee</h2>
                        <table>
                            <tbody>
                                <tr>
                                    <td>Delivery fee:</td>
                                    <td>$${(deliveryFee - totalOrderPrice - totalPickupCost).toFixed(2)}</td>
                                </tr>
                                <tr class="total">
                                    <td>Total Payment:</td>
                                    <td>$${deliveryFee.toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table> */}