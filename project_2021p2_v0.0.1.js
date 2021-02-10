const Discord = require('discord.js');
const bot = new Discord.Client();
const { info, Console } = require('console');
const fs = require('fs');
const { sep } = require('path');
const { builtinModules } = require('module');
const { POINT_CONVERSION_COMPRESSED } = require('constants');
const { Z_BUF_ERROR } = require('zlib');

//General vars
server = null;
infoChannel = null;
logChannel = null;
botChannel = null;
prefix = ',';

sep1 = '|';
sep2 = ';';


//System Roles
warnRoles = [null, null, null, null];
warnRolesPath = 'warnRoles.txt';

//Roles
moderatorRole = null; //Модер
testerRole = null; //Тестер
HWRole = null; //Заполнение дз
adminRole = null; //Админимтратор
developerRole = null; //Разработчик

//Categories
groups = []; //группы, 2-мерный массив, 1 индекс - название предмета + номер группы, 2 индекс - роль, 3 индекс - канал категории
groupPath = 'groups.txt'



//Pathes
serverPath = 'server.txt';
generalChannelsPath = 'channels.txt';
groupChannelsPath = 'groupChannel.txt';
generalRolesPath = 'roles.txt';
groupRolesAndcategoriesPath = 'groupRolesAndCategories.txt';

workAgreed = true;

bot.on('ready', () =>
{
    //Подключение сохранённого сервера
    if(!fs.existsSync(serverPath))
    {
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
                    workAgreed = false;
                }
                else
                {
                    _info('Роль тестера установлена');
                }
                HWRole = server.roles.cache.find(role => role.id == _ids[1]);
                if(HWRole == null)
                {
                    _warn('Роль заполнителя ДЗ не найдена...');
                    workAgreed = false;
                }
                else
                {
                    _info('Роль заполнителя ДЗ установлена');
                }
                moderatorRole = server.roles.cache.find(role => role.id == _ids[2]);
                if(moderatorRole == null)
                {
                    _warn('Роль модератора не найдена...');
                    workAgreed = false;
                }
                else
                {
                    _info('Роль модератора установлена');
                }
                adminRole = server.roles.cache.find(role => role.id == _ids[3]);
                if(adminRole == null)
                {
                    _warn('Роль администратора не найдена...');
                    workAgreed = false;
                }
                else
                {
                    _info('Роль администратора установлена');
                }
                developerRole = server.roles.cache.find(role => role.id == _ids[4]);
                if(developerRole == null)
                {
                    _warn('Роль разработчика не найдена...');
                    workAgreed = false;
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
                    workAgreed = false;
                }
                else
                {
                    _info('Канал управления ботом установлен');
                }
                logChannel = server.channels.cache.find(channel => channel.id == _ids[1]);
                if(logChannel == null)
                {
                    _warn('Канал логирования не найден...');
                    workAgreed = false;
                }
                else
                {
                    _info('Канал логирования установлен');
                }
                infoChannel = server.channels.cache.find(channel => channel.id == _ids[2]);
                if(infoChannel == null)
                {
                    _warn('Канал информации не найден...');
                    workAgreed = false;
                }
                else
                {
                    _info('Канал информации установлен');
                }

            }
            if(fs.existsSync(warnRolesPath))
            {
                _temp = fs.readFileSync(warnRolesPath).toString();
                _ids = _temp.split(sep1);
                warnRoles[0] = server.roles.cache.find(role => role.id == _ids[0]);
                if(warnRoles[0] == null)
                {
                    _warn('Роль warn1 не найдена...');
                    fs.rmSync(warnRolesPath);
                    workAgreed = false;
                }
                else
                {
                    _info('Роль warn1 установлена');
                }
                warnRoles[1] = server.roles.cache.find(role => role.id == _ids[1]);
                if(warnRoles[1] == null)
                {
                    _warn('Роль warn2 не найдена...');
                    fs.unlinkSync(warnRolesPath);
                    workAgreed = false;
                }
                else
                {
                    _info('Роль warn2 установлена');
                }
                warnRoles[2] = server.roles.cache.find(role => role.id == _ids[2]);
                if(warnRoles[2] == null)
                {
                    _warn('Роль mute не найдена...');
                    fs.unlinkSync(warnRolesPath);
                    workAgreed = false;
                }
                else
                {
                    _info('Роль mute установлена');
                }
                warnRoles[3] = server.roles.cache.find(role => role.id == _ids[3]);
                if(warnRoles[3] == null)
                {
                    _warn('Роль default не найдена...');
                    fs.unlinkSync(warnRolesPath);
                    workAgreed = false;
                }
                else
                {
                    _info('Роль default установлена');
                }
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
    
    if(message.author == bot.user || message.author.isBot)
    {
        return;
    }
    

    if(message.channel == botChannel)
    {
        if(msg.startsWith(prefix + 'register'))
        {
            server.members.cache.find(_member => _member.user == message.author).roles.add(warnRoles[3].id);
        }
        else if(msg.startsWith(prefix + 'showGroups'))
        {
            
        }

        else if(!msg.startsWith(prefix))
        {
            message.delete();
        }
            
    }
});
if(fs.existsSync('../token2.txt'))
{
    token = fs.readFileSync('../token2.txt').toString();
    console.log(token);
    bot.login(token).catch(() => console.error("Error: token rejected, chack your bot token..."));
}
else
{
    _err('Error: no token available...');
}

function checkRoles(memberToAction, userToAction)
{
    if((adminRole.members.find(_member => _member.user == userToAction) != null
    || moderatorRole.members.find(_member => _member.user == userToAction) != null
    || developerRole.members.find(_member => _member.user == userToAction) != null
    || bot.user == userToAction)
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

function spaceDeleter(str)
{
    i = 0;
    j = 0;
    while(i < str.length)
    {
        if(str[i] == ' ')
        {
            for(j = i+1; j < str.length; j++)
            {
                if(str[j] != ' ') break;
            }
            if(j - i > 1)
            {
                str = str.substring(0, i+1) + str.substring(j);
                i = 0;
            }
            else
            {
                i++;
            }
        }
        else
        {
            i++;
        }
    }
    str = str.trim();
    return str;
}


function initGroups()
{
    if(!fs.existsSync(groupPath)) return;
    tempRolesAndcCategories = [[], [], []];

    if(fs.existsSync(groupRolesAndcategoriesPath))
    {
        rowStr = fs.readFileSync(groupRolesAndcategoriesPath).toString();
        tempArr = rowStr.split(sep1);
        for(i = 0; i < tempArr.length; i++)
        {
            tempVars = tempArr[i].split(sep2);
            if(tempVars.length < 3) continue;
            tempRolesAndcCategories[0][i] = tempVars[0];
            tempRolesAndcCategories[1][i] = server.roles.cache.find(role => role.id == tempVars[1]);
            tempRolesAndcCategories[2][i] = server.channels.cache.find(channel => channel.id == temVars[2]);
        }
    }
    rowStr = fs.readFileSync(groupPath).toString();
    subjects = rowString.split(sep1);
    for(i = 0; i < subjects.length; i++)
    {
        tempGroups = subjects[i].split(sep2);
        nameOfSubject = tempGroups[0];
        for(i = 1; i < tempGroups.length; i++)
        {
            index = tempRolesAndcCategories[0].findIndex(element => element == nameOfSubject + ' ' + tempGroups[i]);
            if(index != -1)
            {
                groups[0].push(tempRolesAndcCategories[0][index]);
                groups[1].push(tempRolesAndcCategories[1][index]);
                groups[2].push(tempRolesAndcCategories[2][index]);
            }
            else
            {

            }
        }
    }
}

function showMesagesToSelect()
{
}

function createGroup(name)
{
    nRole = null;
    server.roles.create({data: {name: name}}).then(newRole => nRole = newRole);
    server.channels.create({})
}