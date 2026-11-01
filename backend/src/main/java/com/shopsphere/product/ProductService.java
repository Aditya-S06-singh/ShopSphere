package com.shopsphere.product;

import com.shopsphere.common.dto.PagedResponse;
import com.shopsphere.common.exception.ResourceNotFoundException;
import com.shopsphere.common.util.SlugUtils;
import com.shopsphere.product.dto.CreateProductRequest;
import com.shopsphere.product.dto.ProductDto;
import com.shopsphere.product.dto.UpdateProductRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public PagedResponse<ProductDto> getProducts(
            String search,
            Long categoryId,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Boolean inStockOnly,
            Boolean activeOnly,
            Pageable pageable
    ) {
        Specification<Product> spec = ProductSpecification.filterBy(
                search,
                categoryId,
                minPrice,
                maxPrice,
                inStockOnly,
                activeOnly != null ? activeOnly : true
        );

        Page<Product> page = productRepository.findAll(spec, pageable);
        return PagedResponse.fromPage(page.map(ProductDto::fromEntity));
    }

    @Transactional(readOnly = true)
    public ProductDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));
        return ProductDto.fromEntity(product);
    }

    @Transactional(readOnly = true)
    public ProductDto getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with slug: " + slug));
        return ProductDto.fromEntity(product);
    }

    @Transactional
    public ProductDto createProduct(CreateProductRequest request) {
        String trimmedSku = request.sku().trim().toUpperCase();
        if (productRepository.existsBySku(trimmedSku)) {
            throw new IllegalArgumentException("A product with SKU '" + trimmedSku + "' already exists.");
        }

        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + request.categoryId()));

        String baseSlug = SlugUtils.toSlug(request.name().trim());
        String finalSlug = baseSlug;
        int counter = 1;
        while (productRepository.existsBySlug(finalSlug)) {
            finalSlug = baseSlug + "-" + counter++;
        }

        Product product = new Product(
                request.name().trim(),
                finalSlug,
                request.description().trim(),
                request.price(),
                request.stockQuantity(),
                trimmedSku,
                request.imageUrl() != null ? request.imageUrl().trim() : null,
                category
        );

        return ProductDto.fromEntity(productRepository.save(product));
    }

    @Transactional
    public ProductDto updateProduct(Long id, UpdateProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));

        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + request.categoryId()));

        product.setName(request.name().trim());
        product.setDescription(request.description().trim());
        product.setPrice(request.price());
        product.setStockQuantity(request.stockQuantity());
        product.setImageUrl(request.imageUrl() != null ? request.imageUrl().trim() : null);
        product.setCategory(category);
        if (request.active() != null) {
            product.setActive(request.active());
        }

        return ProductDto.fromEntity(productRepository.save(product));
    }

    @Transactional
    public ProductDto updateStock(Long id, Integer newQuantity) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));

        product.setStockQuantity(newQuantity);
        return ProductDto.fromEntity(productRepository.save(product));
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));

        // Soft delete to protect relational integrity with future orders/carts
        product.setActive(false);
        productRepository.save(product);
    }
}

