import express from 'express'
import {PrismaClient} from '@prisma/client'
import cors from 'cors'

import {convertHoursStringToMinutes} from './utils/convert-hours-string-to-minutes';
import {convertMinutesToHourString} from './utils/convert-minutes-to-hour-string';

const app = express();
const prisma = new PrismaClient({
    log:['query']
});


app.use(express.json());
app.use(cors({
    // origin: 'https://
}));

app.get('/games', async (request, response) => {
    const games = await prisma.game.findMany({
        include: {
            _count: {
                select: {
                    ads: true,
                }
            }
        }
    })
    return response.json(games);
})

app.get('/ads', (request, response) => {
    return response.status(201).json([]);
})

app.post('/games/:id/ads', async (request, response) => {
    const gameId = request.params.id;
    const body : any = request.body;

    const ad = await prisma.ad.create({
        data: {
            gameId,
            name: body.name,
            yearsPlaying: body.yearsPlaying,
            discord: body.discord,
            weekDay: body.weekDay.join(','),
            hourStart: convertHoursStringToMinutes(body.hourStart), 
            hourEnd: convertHoursStringToMinutes(body.hourEnd), 
            useVoiceCHannel: body.useVoiceCHannel,
        }
    })

    return response.status(201).json(ad);
})

app.get('/games/:id/ads', async (request, response) => {
    const gameId = request.params.id;

    const ads = await prisma.ad.findMany({
        select: {
            id: true,
            name: true,
            useVoiceCHannel: true,
            weekDay: true,
            yearsPlaying: true,
            hourStart: true,
            hourEnd: true,
        },
        where:{
            gameId
        },
        orderBy: {
            createdAt: 'desc'
        }
    })
    return response.json(ads.map(ads =>{
        return {
            ...ads,
            weekDays: ads.weekDay.split(','),
            hourStart: convertMinutesToHourString(ads.hourStart),
            hourEnd: convertMinutesToHourString(ads.hourEnd)
        }
    }))
})

app.get('/ads/:id/discord', async (request, response) => {
    const adId = request.params.id;

    const ad = await prisma.ad.findUniqueOrThrow({
        select: {
            discord: true,
        },
        where: {
            id: adId,
        }
    })

    return response.json(ad.discord)
})

app.listen(3333)