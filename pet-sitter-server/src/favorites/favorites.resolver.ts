import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { FavoritesService } from './favorites.service';
import { JobModel } from '../jobs/models/job.model';
import { ToggleFavoriteResult } from './models/toggle-favorite-result.model';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import type { User } from '@prisma/client';

@Resolver()
export class FavoritesResolver {
    constructor(private readonly favoritesService: FavoritesService) {}

    @Mutation(() => ToggleFavoriteResult, { description: '즐겨찾기 토글 (PetSitter만 가능)' })
    @Roles(Role.PetSitter)
    toggleFavorite(
        @Args('jobId', { type: () => ID }) jobId: string,
        @CurrentUser() user: User,
    ) {
        return this.favoritesService.toggle(user.id, jobId);
    }

    @Query(() => [JobModel], { description: '내 즐겨찾기 공고 목록 (PetSitter만 가능)' })
    @Roles(Role.PetSitter)
    myFavorites(@CurrentUser() user: User) {
        return this.favoritesService.findByUser(user.id);
    }
}
