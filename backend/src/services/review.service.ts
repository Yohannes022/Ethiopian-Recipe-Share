import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { CreateReviewDto, UpdateReviewDto } from '../dto/review.dto';
import { IUser } from '../interfaces/user.interface';
import { IReview } from '../interfaces/review.interface';
import { ReviewRepository } from '../repositories/review.repository';

@Injectable()
export class ReviewService {
  constructor(
    private readonly reviewRepository: ReviewRepository,
  ) {}

  /**
   * Create a new review
   */
  async createReview(createReviewDto: CreateReviewDto): Promise<IReview> {
    // Check if user has already reviewed this recipe
    const hasReviewed = await this.reviewRepository.hasUserReviewed(
      createReviewDto.userId,
      createReviewDto.targetId
    );

    if (hasReviewed) {
      throw new ForbiddenException('You have already reviewed this recipe');
    }

    // Add user details to the review
    const reviewData = {
      ...createReviewDto,
      isApproved: false, // Set to false for moderation, or true if no moderation needed
      userDetails: {
        name: createReviewDto.userDetails?.name || 'Anonymous',
        avatar: createReviewDto.userDetails?.avatar,
      },
    };

    return this.reviewRepository.create(reviewData);
  }

  /**
   * Get reviews for a specific recipe
   */
  async getRecipeReviews(
    recipeId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    return this.reviewRepository.findByRecipe(recipeId, page, limit);
  }

  /**
   * Get a single review by ID
   */
  async getReviewById(id: string): Promise<IReview | null> {
    return this.reviewRepository.findById(id);
  }

  /**
   * Update a review
   */
  async updateReview(
    id: string,
    userId: string,
    updateData: UpdateReviewDto,
  ): Promise<IReview | null> {
    const review = await this.reviewRepository.findById(id);

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Check if the user is the owner of the review
    if (review.userId.toString() !== userId.toString()) {
      throw new ForbiddenException('You are not authorized to update this review');
    }

    return this.reviewRepository.update(id, updateData);
  }

  /**
   * Delete a review
   */
  async deleteReview(
    id: string,
    userId: string,
    isAdmin: boolean = false,
  ): Promise<boolean> {
    const review = await this.reviewRepository.findById(id);

    if (!review) {
      return false;
    }

    // Check if the user is the owner of the review or an admin
    if (review.userId.toString() !== userId.toString() && !isAdmin) {
      throw new ForbiddenException('You are not authorized to delete this review');
    }

    return this.reviewRepository.delete(id);
  }

  /**
   * Get reviews by user
   */
  async getUserReviews(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    // This would be implemented in the repository if needed
    throw new Error('Method not implemented');
  }
  
  /**
   * Get review statistics for a recipe
   */
  async getReviewStats(recipeId: string) {
    return this.reviewRepository.getReviewStats(recipeId);
  }
}
