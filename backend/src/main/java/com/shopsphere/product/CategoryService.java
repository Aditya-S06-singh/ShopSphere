package com.shopsphere.product;

import com.shopsphere.common.exception.EmailAlreadyInUseException;
import com.shopsphere.common.exception.ResourceNotFoundException;
import com.shopsphere.common.util.SlugUtils;
import com.shopsphere.product.dto.CategoryDto;
import com.shopsphere.product.dto.CategoryRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(CategoryDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public CategoryDto getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));
        return CategoryDto.fromEntity(category);
    }

    @Transactional(readOnly = true)
    public CategoryDto getCategoryBySlug(String slug) {
        Category category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with slug: " + slug));
        return CategoryDto.fromEntity(category);
    }

    @Transactional
    public CategoryDto createCategory(CategoryRequest request) {
        String trimmedName = request.name().trim();
        if (categoryRepository.existsByName(trimmedName)) {
            throw new IllegalArgumentException("A category with name '" + trimmedName + "' already exists.");
        }

        String baseSlug = SlugUtils.toSlug(trimmedName);
        String finalSlug = baseSlug;
        int counter = 1;
        while (categoryRepository.existsBySlug(finalSlug)) {
            finalSlug = baseSlug + "-" + counter++;
        }

        Category category = new Category(
                trimmedName,
                finalSlug,
                request.description() != null ? request.description().trim() : null,
                request.imageUrl() != null ? request.imageUrl().trim() : null
        );

        return CategoryDto.fromEntity(categoryRepository.save(category));
    }

    @Transactional
    public CategoryDto updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));

        String trimmedName = request.name().trim();
        if (!category.getName().equalsIgnoreCase(trimmedName) && categoryRepository.existsByName(trimmedName)) {
            throw new IllegalArgumentException("A category with name '" + trimmedName + "' already exists.");
        }

        category.setName(trimmedName);
        category.setDescription(request.description() != null ? request.description().trim() : null);
        category.setImageUrl(request.imageUrl() != null ? request.imageUrl().trim() : null);

        return CategoryDto.fromEntity(categoryRepository.save(category));
    }

    @Transactional
    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Category not found with ID: " + id);
        }
        categoryRepository.deleteById(id);
    }
}
