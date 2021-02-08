const Discord = require('discord.js');
const bot = new Discord.Client();
const { info, Console } = require('console');
const fs = require('fs');
const { sep } = require('path');
const { builtinModules } = require('module');

//General vars
server = null;
infoChannel = null;
logChannel = null;
botChannel = null;
prefix = ',';

sep1 = '|';
sep2 = ';';


//System Roles
warnRoles = [null, null];
warnRolesPath = 'warnRoles.txt';

//banList
muteList = [];
//banList
banList = []
//Roles
groupRoles = []; //группы, 2-мерный массив, 1 индекс - название предмета, второй - номер группы
moderatorRole = null; //Модер
testerRole = null; //Тестер
HWRole = null; //Заполнение дз
adminRole = null; //Админимтратор
developerRole = null; //Разработчик

//Categories
groupCategories = [];

//Pathes
serverPath = 'server.txt';
generalChannelsPath = 'channels.txt';
groupChannelsPath = 'groupChannel.txt';
generalRolesPath = 'roles.txt';
groupRolesPath = 'groupRoles.txt';
bot.on('ready', () =>
{
    //Подключение сохранённого сервера
    if(!fs.existsSync(serverPath))
    {
        _err("Файл с сохранённым сервером не обнаружен, ожидание команды !connect для подключения сервера...");
    }
    else
    {
        _info("Файл с сохранённым сервером обнаружен. Попытка подключения...");
        _serverId = fs.readFileSync(serverPath);
        server = bot.guilds.cache.find(guild => guild.id == _serverId);
        if(server != null)
        {
            _info('Сервер подключён.')
            if(fs.existsSync(generalRolesPath))
            {
                const _temp = fs.readFileSync(generalRolesPath).toString();
                _ids = _temp.split(sep1);
                testerRole = server.roles.cache.find(role => role.id == _ids[0]);
                if(testerRole == null)
                {
                    _warn('Роль тестера не найдена...');
                }
                else
                {
                    _info('Роль тестера установлена');
                }
                HWRole = server.roles.cache.find(role => role.id == _ids[1]);
                if(HWRole == null)
                {
                    _warn('Роль заполнителя ДЗ не найдена...');
                }
                else
                {
                    _info('Роль заполнителя ДЗ установлена');
                }
                moderatorRole = server.roles.cache.find(role => role.id == _ids[2]);
                if(moderatorRole == null)
                {
                    _warn('Роль модератора не найдена...');
                }
                else
                {
                    _info('Роль модератора установлена');
                }
                adminRole = server.roles.cache.find(role => role.id == _ids[3]);
                if(adminRole == null)
                {
                    _warn('Роль администратора не найдена...');
                }
                else
                {
                    _info('Роль администратора установлена');
                }
                developerRole = server.roles.cache.find(role => role.id == _ids[4]);
                if(developerRole == null)
                {
                    _warn('Роль разработчика не найдена...');
                }
                else
                {
                    _info('Роль разработчика установлена');
                }
            }
            if(fs.existsSync(generalChannelsPath))
            {
                const _temp = fs.readFileSync(generalChannelsPath).toString();
                _ids = _temp.split(sep1);
                botChannel = server.channels.cache.find(channel => channel.id == _ids[0]);
                if(botChannel == null)
                {
                    _warn('Канал управления ботом не найден...');
                }
                else
                {
                    _info('Канал управления ботом установлен');
                }
                logChannel = server.channels.cache.find(channel => channel.id == _ids[1]);
                if(logChannel == null)
                {
                    _warn('Канал логирования не найден...');
                }
                else
                {
                    _info('Канал логирования установлен');
                }
                infoChannel = server.channels.cache.find(channel => channel.id == _ids[2]);
                if(infoChannel == null)
                {
                    _warn('Канал информации не найден...');
                }
                else
                {
                    _info('Канал информации установлен');
                    infoChannel.send('```Бот запущен и готов к работе```');
                }

            }
            if(fs.existsSync(warnRolesPath))
            {
                _temp = fs.readFileSync(warnRolesPath).toString();
                _ids = _temp.split(sep1);
                warnRoles[0] = server.roles.cache.find(role => role.id == _ids[0]);
                if(warnRoles[0] == null)
                {
                    _warn('Роль warn1 не найдена...')
                    fs.rmSync(warnRolesPath);
                }
                else
                {
                    _info('Роль warn1 установлена')
                }
                warnRoles[1] = server.roles.cache.find(role => role.id == _ids[1]);
                if(warnRoles[1] == null)
                {
                    _warn('Роль warn2 не найдена...')
                    fs.rmSync(warnRolesPath);
                }
                else
                {
                    _info('Роль warn2 установлена')
                }
                warnRoles[2] = server.roles.cache.find(role => role.id == _ids[2]);
                if(warnRoles[2] == null)
                {
                    _warn('Роль mute не найдена...')
                    fs.rmSync(warnRolesPath);
                }
                else
                {
                    _info('Роль mute установлена')
                }
                warnRoles[3] = server.roles.cache.find(role => role.id == _ids[3]);
                if(warnRoles[3] == null)
                {
                    _warn('Роль default не найдена...')
                    fs.rmSync(warnRolesPath);
                }
                else
                {
                    _info('Роль default установлена')
                }
            }
            else
            {
                server.roles.create({data: {name: "Warn[1/3]"}}).then(newRole => warnRoles[0] = newRole);
                server.roles.create({data: {name: "Warn[2/3]"}}).then(newRole => warnRoles[1] = newRole);
                server.roles.create({data: {name: "Mute", position: server.roles.cache.array().length}}).then(newRole => warnRoles[2] = newRole);
                server.roles.create({data: {name: "User", position: server.roles.cache.array().length}}).then(newRole => warnRoles[3] = newRole).then(() => fs.writeFileSync(warnRolesPath, warnRoles[0].id + sep1 + warnRoles[1].id + sep1 + warnRoles[2].id + sep1 + warnRoles[3].id));
            }

        }
        else
        {
            _err("Сохранённый сервер не может быть найден или подключён. Ожидание команды !connect для подключения нового сервера...")
        }
    }
});

isSetup = false;
stageSetup = 0;
bot.on('message', message =>
{
    //console.log('Зарегистрировано сообщение от ' + message.author.username); //отладочное, будет удалено
    msg = message.content;
    
    if(message.author == bot.user)
    {
        return;
    }
    
    if(msg.startsWith(prefix + 'connect'))
    {
        botChannel = message.channel;
        server = message.guild;
        fs.writeFileSync(serverPath, server.id, 'utf8');
        return;
    }

    if(isSetup)
        {
            switch(stageSetup)
            {
                case 0:
                    testerRole = message.mentions.roles.first();
                    if(testerRole == null)
                    {
                        message.channel.send('Ошибка, отмена настройки...');
                        isSetup = false;
                        stageSetup = 0;
                        return;
                    }
                    else
                    {
                        message.channel.send('Роль тестера установлена.\nВведите через тег роль заполнителя ДЗ...');
                        stageSetup = 1;
                    }
                break;
                case 1:
                    HWRole = message.mentions.roles.first();
                    if(HWRole == null)
                    {
                        message.channel.send('Ошибка, отмена настройки...');
                        isSetup = false;
                        stageSetup = 0;
                        return;
                    }
                    else
                    {
                        message.channel.send('Роль заполнителя ДЗ установлена.\nВведите через тег роль модератора...');
                        stageSetup = 2;
                    }
                break;
                case 2:
                    moderatorRole = message.mentions.roles.first();
                    if(moderatorRole == null)
                    {
                        message.channel.send('Ошибка, отмена настройки...');
                        isSetup = false;
                        stageSetup = 0;
                        return;
                    }
                    else
                    {
                        message.channel.send('Роль модератора установлена.\nУкажите через тег роль администратора...');
                        stageSetup = 3;
                    }
                break;
                case 5:
                    
                        _tempChannel = botChannel;
                        botChannel = null;
                        botChannel = message.mentions.channels.first();
                        if(botChannel == null)
                        {
                            botChannel = _tempChannel;
                            message.channel.send('Ошибка, отмена настройки....');
                            isSetup = false;
                            stageSetup = 0;
                        }
                        else
                        {
                            message.channel.send('Канал установлен.\nВведите через хештег канал логирования бота...');
                            stageSetup = 6;
                        }
                    
                break;
                case 6:
                    
                        _tempChannel = logChannel;
                        logChannel = null;
                        logChannel = message.mentions.channels.first();
                        if(logChannel == null)
                        {
                            logChannel = _tempChannel;
                            message.channel.send('Ошибка, отмена настройки....');
                            isSetup = false;
                            stageSetup = 0;
                        }
                        else
                        {
                            message.channel.send('Канал установлен.\nВведите через хештег канал информации...');
                            stageSetup = 7;
                        }
                    
                break;
                case 7:

                        _tempChannel = infoChannel;
                        infoChannel = null;
                        infoChannel = message.mentions.channels.first();
                        if(botChannel == null)
                        {
                            infoChannel = _tempChannel;
                            message.channel.send('Ошибка, отмена настройки....');
                            isSetup = false;
                            stageSetup = 0;
                        }
                        else
                        {
                            message.channel.send('Канал установлен, настройка каналов завершена.\nВыполняю сохранение...\n');
                            stageSetup = 0;
                            isSetup = false;
                            fs.writeFileSync(generalChannelsPath, botChannel+sep1+logChannel+sep1+infoChannel, 'utf8')
                            console.log('Администратор обновил основные каналы...');
                        }  
                break;
                case 3:
                        adminRole = message.mentions.roles.first();
                        if(adminRole == null)
                        {
                            message.channel.send('Ошибка, отмена настройки....');
                            isSetup = false;
                            stageSetup = 0;
                        }
                        else
                        {
                            message.channel.send('Роль установлена. Укажите через тег роль разработчика...')
                            stageSetup = 4;
                        }
                break;
                case 4:
                        developerRole = message.mentions.roles.first();
                        if(developerRole == null)
                        {
                            message.channel.send('Ошибка, отмена настройки....');
                            isSetup = false;
                            stageSetup = 0;
                        }
                        else
                        {
                            message.channel.send('Роль установлена. Выполняю сохранение...\nУкажите через хештег канал управления ботом...')
                            stageSetup = 5;
                            fs.writeFileSync(generalRolesPath, testerRole.id + sep1 + HWRole.id + sep1 + moderatorRole.id + sep1 + adminRole.id + sep1 + developerRole.id, 'utf8');
                            console.log('Администратор обновил основные роли...');
                        }
                break;
                default:
                    message.channel.send("Что-то пошло не так:/");
            }
        }
    if(message.channel == botChannel)
    {
        //console.log('Зарегистрировано сообщение для бота от ' + message.author.username);
            if(msg.startsWith(prefix + 'setup'))
            {
                isSetup = true;
                stageSetup = 0;
                message.channel.send('Введите через тег роль тестера...');
            }
            else if(msg.startsWith(prefix + 'ban'))
            {
                userToBan = message.mentions.members.first();
                args = msg.split(' ');
                if(args.length < 4) return;
                _reason = '';
                for(i = 3; i < args.length; i++)
                {
                    _reason += args[i] + ' ';
                }
                _reason += '\b';
                _time = args[2];
                if(ban(userToBan, message.author, _reason, _time))
                {
                    _warn(`${message.author.username} забанил пользователя ${userToBan.user.username}`);
                    message.reply('Пользователь забанен');
                }
                else
                {
                    message.reply('Вы не являетесь администратором сервера или пользователь является модератором, администратором или разработчиком');
                }
            }
            else if(msg.startsWith(prefix + 'kick'))
            {
            }
            else if(msg.startsWith(prefix + 'warn'))
            {
                userToWarn = message.mentions.members.first();
                args = msg.split(' ');
                if(args.length < 3) return;
                _reason = '';
                for(i = 2; i < args.length; i++)
                {
                    _reason += args[i] + ' ';
                }
                _reason += '\b';
                if(warn(userToWarn, message.author, _reason))
                {
                    _warn(`${message.author.username} выдал предупреждение польщователю ${userToWarn.user.username}`);
                    message.reply(`Пользователю выдано предупреждение.`)
                }
                else
                {
                    message.reply('Вы не являетесь администратором, модератором или разработчиком или пользователь является модератором, администратором или разработчиком');
                }
            }
            else if(msg.startsWith(prefix + 'mute'))
            {
                userToMute = message.mentions.members.first();
                args = msg.split(' ');
                if(args.length < 4) return;
                _reason = '';
                for(i = 3; i < args.length; i++)
                {
                    _reason += args[i] + ' ';
                }
                _reason += '\b';
                _time = args[2];
                if(mute(userToMute, message.author, _reason, _time))
                {
                    _warn(`${message.author.username} выдал мут польщователю ${userToMute.user.username}`);
                    message.reply(`Пользователю выдан MUTE.`)
                }
                else
                {
                    message.reply('Вы не являетесь администратором, модератором или разработчиком или пользователь является модератором, администратором или разработчиком');
                }
            }
            else if(msg.startsWith(prefix + 'pban'))
            {
                userToBan = message.mentions.members.first();
                args = msg.split(' ');
                if(args.length < 3) return;
                _reason = '';
                for(i = 2; i < args.length; i++)
                {
                    _reason += args[i] + ' ';
                }
                _reason += '\b';
                if(pBan(userToBan, message.author, _reason))
                {
                    _warn(`${message.author.username} забанил пользователя ${userToBan.user.username} навсегда`);
                    message.reply('Пользователь забанен навсегда');
                }
                else
                {
                    message.reply('Вы не являетесь администратором сервера или пользователь является модератором, администратором или разработчиком');
                }
            }

            else if(!msg.startsWith(prefix))
            {
                message.delete();
            }
            
    }
});
if(fs.existsSync('../token.txt'))
{
    token = fs.readFileSync('../token.txt').toString();
    console.log(token);
    bot.login(token).catch(() => console.error("Error: token rejected, chack your bot token..."));
}
else
{
    console.error('Error: no token available...');
}

bot.on('guildMemberAdd', member =>
{
    //member.roles.add(warnRoles[3].id);
    logChannel.send(`<@${member.user.id}> присоединился к серверу...`);
    _info(`Новый пользователь: ${member.user.username}`)
})

function checkRoles(memberToAction, userToAction)
{
    if((adminRole.members.find(_member => _member.user == userToAction) != null
    || moderatorRole.members.find(_member => _member.user == userToAction) != null
    || developerRole.members.find(_member => _member.user == userToAction) != null)
    && (adminRole.members.find(_member => _member == memberToAction) == null
    && moderatorRole.members.find(_member => _member == memberToAction) == null
    && developerRole.members.find(_member => _member == memberToAction) == null))
    {
        return true;
    }
    else
    {
        return false;
    }
}

function _info(_msg)
{
    console.log('\x1b[32mINFO: \x1b[0m' + _msg);
}

function _warn(_msg)
{
    console.log('\x1b[33mWARN: \x1b[0m' + _msg);
}

function _err(_msg)
{
    console.log('\x1b[31mERROR: \x1b[0m' + _msg);
}

function warn(memberToAction, adm, reason)
{
    if(!checkRoles(memberToAction, adm))
        return false;
    if(warnRoles[0].members.find(member => member == memberToAction))
    {
        memberToAction.roles.remove(warnRoles[0]);
        memberToAction.roles.add(warnRoles[1], reason);
        logChannel.send(`Пользователь <@${memberToAction.user.id}> получает **[2/3] предупреждение** от <@${adm.id}> **по причине:** ${reason}`);
    }
    else if(warnRoles[1].members.find(member => member == memberToAction))
    {
        memberToAction.roles.remove(warnRoles[1]);
        mute(memberToAction, adm, '[3/3] предупреждений', 300);
        logChannel.send(`Пользователь <@${memberToAction.user.id}> получает **[3/3] предупреждение => MUTE 300 минут** от <@${adm.id}> **по причине:** ${reason}`);
    }
    else if(warnRoles[2].members.find(member => member == memberToAction))
    {
        memberToAction.roles.remove(warnRoles[2]);
        //memberToAction.roles.add(warnRoles[1], reason);
        ban(memberToAction, adm, '[4/3] предупреждений', 7);
        logChannel.send(`Пользователь <@${memberToAction.user.id}> получает **[4/3] предупреждение => BAN 7 дней** от <@${adm.id}> **по причине:** ${reason}`);
    }
    else
    {
        //memberToAction.roles.remove(warnRoles[0]);
        memberToAction.roles.add(warnRoles[0], reason);
        logChannel.send(`Пользователь <@${memberToAction.user.id}> получает **[1/3] предупреждение** от <@${adm.id}> **по причине:** ${reason}`);
    }
    return true;
}

function pBan(memberToAction, adm, reason)
{
    if(!checkRoles(memberToAction, adm))
        return false;
    memberToAction.ban({reason: reason});
    logChannel.send(`Пользователь <@${memberToAction.user.id}> получает **PermBan** от <@${adm.id}> **по причине:** ${reason}`);
    return true;
}

function ban(memberToAction, adm, reason, timeToBan)
{
    if(!checkRoles(memberToAction, adm))
        return false;
    memberToAction.ban({reason: reason}).then(() => setTimeout(() => {server.members.unban(memberToAction.user.id, 'Временный бан завершён')}, timeToBan * 24 * 60 * 60000));
    logChannel.send(`Пользователь <@${memberToAction.user.id}> получает **BAN ${timeToBan} дней** от <@${adm.id}> **по причине:** ${reason}`);
    return true;
}

function kick(memberToAction, adm, reason)
{

}

function mute(memberToAction, adm, reason, timeToMute)
{
    if(!checkRoles(memberToAction, adm))
        return false;
    memberToAction.roles.add(warnRoles[2].id).then(() => setTimeout(() => {memberToAction.roles.remove(warnRoles[2])}, timeToMute * 60000));
    logChannel.send(`Пользователь <@${memberToAction.user.id}> получает **MUTE ${timeToMute} минут** от <@${adm.id}> **по причине:** ${reason}`);
    return true;
}

function unMute(memberToAction, adm, reason)
{

}

function unBan(memberToAction, adm, reason)
{

}