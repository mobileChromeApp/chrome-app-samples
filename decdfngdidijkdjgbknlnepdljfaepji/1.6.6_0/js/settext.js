
function settext(){

$('.setupsync').text(getI18nMsg('sonline'));


$('#systemLists li cite:eq(0)').text(getI18nMsg('unread'));
$('#systemLists li cite:eq(1)').text(getI18nMsg('archive'));
$('#options ul li div:eq(1)').text(getI18nMsg('synconline'));
$('#options ul li div:eq(3)').text(getI18nMsg('preferences'));
$('#option_1 tr td label:eq(0)').text(getI18nMsg('shortcuts'));
$('#option_1 tr td label:eq(1)').text(getI18nMsg('saveclosetab'));
$('#sync_1 td p:eq(0)').text(getI18nMsg('newdiigo'));
$('#sync_1 td p:eq(2)').text(getI18nMsg('havediigo'));

$('input[name=diigo_user]').attr('placeholder',getI18nMsg('username_email'));
$('input[name=diigo_pwd]').attr('placeholder',getI18nMsg('password'));



$('.aboutdiigo h2:eq(0)').text(getI18nMsg('saveonline'));
$('.aboutdiigo h2:eq(1)').text(getI18nMsg('aboutdiigo'));
$('.aboutdiigo p:eq(0)').text(getI18nMsg('saveonline_d'));
$('.aboutdiigo p:eq(1)').text(getI18nMsg('aboutdiigo_d'));
$('.aboutdiigo ul li:eq(0)').text(getI18nMsg('aboutdiigo_1'));
$('.aboutdiigo ul li:eq(1)').text(getI18nMsg('aboutdiigo_2'));
$('.aboutdiigo ul li:eq(2)').text(getI18nMsg('aboutdiigo_3'));
$('.aboutdiigo ul li:eq(3)').text(getI18nMsg('aboutdiigo_4'));
$('.aboutdiigo ul li:eq(4) a').text(getI18nMsg('learnmore'));



$('.option_bottom span').text(getI18nMsg('close'));
$('#sync_1 td:eq(1) p span:eq(0)').text(getI18nMsg('signin'));




$('#neterrordialog').text(getI18nMsg('networkerror'));
$('#StopSyncdialog').text(getI18nMsg('stopsync'));
$('.normalLink').text(getI18nMsg('morelink'));
}