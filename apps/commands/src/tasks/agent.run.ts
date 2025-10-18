import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { AgentGraphService } from '@gitroom/nestjs-libraries/agent/agent.graph.service';
import { GeneratorDto } from '@gitroom/nestjs-libraries/dtos/generator/generator.dto';

@Injectable()
export class AgentRun {
  constructor(private _agentGraphService: AgentGraphService) {}
  @Command({
    command: 'run:agent',
    describe: 'Run the agent',
  })
  async agentRun() {
    const generatorDto: GeneratorDto = {
      research: 'hello',
      isPicture: true,
      format: 'one_short',
      tone: 'personal'
    };
    
    console.log(await this._agentGraphService.start('test-org-id', generatorDto));
  }
}
