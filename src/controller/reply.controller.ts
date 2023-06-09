import { Body, Controller, Delete, Get, Param, Post, Put, Res } from "@nestjs/common";
import { repl } from "@nestjs/core";
import { Response } from 'express';
import { Respostas } from "src/dto/usuario.dto";
import { ReplyService } from "src/service/reply.service";

@Controller('reply')
export class ReplyController {
    constructor(private replyService: ReplyService) { }

    @Post('/create/:_postId')
    async createReply(@Param() _postId, @Body() reply: Respostas, @Res() res: Response) {
        let arrNotAccepted = [];

        Object.keys(reply).map(key => {
            if (key == "criadoEm" ||
                key == "atualizadoEm" ||
                key == "curtidas") {
                arrNotAccepted.push(key);
            }
        });

        if (arrNotAccepted.length > 0) {
            return res.status(422).send({ message: `Campo(s) não aceito(s) para criação de resposta: ${arrNotAccepted}` })
        } else if (!reply.usuario || !reply.respostaTexto) {
            return res.status(422).send({ message: `Preencha os campos obrigatórios: usuario, respostaTexto` })

        } else {
            reply.criadoEm = new Date();
            reply.atualizadoEm = new Date();
            reply.curtidas = [];
            await this.replyService.createReply(_postId._postId, reply);
            return res.status(201).send({ message: "Resposta criada com sucesso." });
        }
    }

    @Get('/list/:_postId')
    async getRepliesById(@Param() _postId, @Res() res: Response) {
        let replies = await this.replyService.getRepliesById(_postId._postId);
        return res.status(200).send(replies["posts"].map(item => item.respostas).flat());
    }

    @Put('/update/:_replyId')
    async updateReplyById(@Param() _replyId, @Body() reply: Respostas, @Res() res: Response) {
        let arrNotAccepted = [];

        Object.keys(reply).map(key => {
            if (key != "respostaTexto") {
                arrNotAccepted.push(key);
            }
        });

        if (arrNotAccepted.length > 0) {
            return res.status(422).send({ message: `Campo(s) não aceito(s) para atualizar: ${arrNotAccepted}` })
        } else {
            let respostaTexto = reply.respostaTexto;
            reply.respostaTexto = `[EDITADO] ${respostaTexto}`
            reply.atualizadoEm = new Date();
            await this.replyService.updateReplyById(_replyId._replyId, reply);
            return res.status(201).send({ message: "Resposta atualizada com sucesso." })
        }

    }

    @Post('/like/:_id')
    async likeReplyById(@Param() _id, @Body() user, @Res() res: Response) {
        if (!user.usermame) {
            return res.status(422).send({ message: "Não foi encontrado alguém que curtiu!" })
        }

        await this.replyService.likeReplyById(_id._id, user.usermame);
        return res.status(201).send({ message: "Curtida Inserida com Sucesso." })
    }

    @Delete('/delete/:_replyId')
    async deleteReplyById(@Param() _replyId, @Res() res: Response) {
        await this.replyService.deleteReplyById(_replyId._replyId);
        return res.status(201).send({ message: "Resposta deletada com sucesso." })
    }

}