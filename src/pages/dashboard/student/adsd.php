<?php
/**
 * Template part for displaying single posts (News Final Layout v3).
 *
 * VISUAL ORDER (LOCKED):
 * 1. Gambar Berita
 * 2. Sumber Foto
 * 3. Judul
 * 4. Tanggal / Redaksi
 * 5. Isi Berita
 * 6. Tombol Share WhatsApp (custom text)
 *
 * @package Astra
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

astra_entry_before();
?>

<article
<?php
	echo wp_kses_post(
		astra_attr(
			'article-single',
			array(
				'id'    => 'post-' . get_the_ID(),
				'class' => join( ' ', get_post_class() ),
			)
		)
	);
?>
>

	<?php astra_entry_top(); ?>

	<!-- ===== FEATURED IMAGE ===== -->
	<?php if ( has_post_thumbnail() ) : ?>
		<figure class="news-featured-figure">
			<?php the_post_thumbnail( 'full', array( 'class' => 'news-featured-image' ) ); ?>

			<?php
			$photo_caption = get_the_post_thumbnail_caption();
			if ( ! empty( $photo_caption ) ) :
				?>
				<figcaption class="news-featured-caption">
					<?php echo esc_html( $photo_caption ); ?>
				</figcaption>
			<?php endif; ?>
		</figure>
	<?php endif; ?>

	<!-- ===== TITLE & META ===== -->
	<header class="news-entry-header">
		<h1 class="news-title"><?php the_title(); ?></h1>
		<div class="news-meta">
			<?php echo get_the_date( 'd/m/Y' ); ?> / Redaksi Akselerasi News
		</div>
	</header>

	<!-- ===== CONTENT ===== -->
	<div class="news-entry-content">
		<?php
		the_content();

		wp_link_pages(
			array(
				'before' => '<div class="page-links">',
				'after'  => '</div>',
			)
		);
		?>
	</div>

	<?php
	/**
	 * ==================================================
	 * SHARE WHATSAPP (LOGIC ONLY – TIDAK PENGARUHI VISUAL)
	 * ==================================================
	 */

	$title = get_the_title();
	$url   = get_permalink();

	// Ambil konten mentah
	$raw_content = get_post_field( 'post_content', get_the_ID() );

	// Hapus komentar Gutenberg
	$raw_content = preg_replace( '/<!--(.|\s)*?-->/', '', $raw_content );

	// Bersihkan shortcode & HTML
	$clean_content = wp_strip_all_tags( strip_shortcodes( $raw_content ) );

	// Fallback aman
	if ( empty( $clean_content ) ) {
		$clean_content = $title;
	}

	// Ringkasan ±45 kata
	$excerpt = wp_trim_words( $clean_content, 45, '...' );

	// Final teks WhatsApp
	$wa_text = urlencode(
		$title . "\n\n" .
		$excerpt . "\n\n" .
		"Baca selengkapnya:\n" .
		$url
	);
	?>

	<!-- ===== SHARE ===== -->
	<div class="news-share">
		<a
			href="https://api.whatsapp.com/send?text=<?php echo $wa_text; ?>"
			target="_blank"
			rel="noopener noreferrer"
			class="share-whatsapp"
			aria-label="Bagikan ke WhatsApp"
		></a>
	</div>

	<?php astra_entry_bottom(); ?>

</article>

<?php astra_entry_after(); ?>

<style>


/* ===== FEATURED IMAGE RESPONSIVE (SAFE FOR PORTRAIT) ===== */
.news-featured-media {
	max-width: 100%;
	overflow: visible; /* penting */
}

.news-featured-image {
	width: 100%;
	height: auto;          /* KUNCI UTAMA */
	display: block;
	border-radius: 8px;
	object-fit: contain;  /* JANGAN cover */
	background-color: #f5f5f5;
}




/* ===== PHOTO SOURCE ===== */
.news-featured-caption {
	margin-top: 6px;
	font-size: 13px;
	color: #666;
	font-style: italic;
}

/* ===== TITLE & META ===== */
.news-entry-header {
	margin-bottom: 20px;
}

.news-title {
	font-size: 28px;
	line-height: 1.25;
	margin: 0 0 8px;
	color: #111;
}

.news-meta {
	font-size: 14px;
	color: #666;
}

/* ===== CONTENT ===== */
.news-entry-content {
	font-size: 16px;
	line-height: 1.7;
	color: #222;
}

/* ===== SHARE ===== */
.news-share {
	margin-top: 32px;
	display: flex;
	gap: 10px;
}

.share-whatsapp {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 42px;
	height: 42px;
	border-radius: 50%;
	background-color: #25D366;
	text-decoration: none;
	position: relative;
}

.share-whatsapp::before {
	content: '';
	width: 20px;
	height: 20px;
	background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="white"><path d="M380.9 97.1C339 55.1 283.2 32 224.5 32c-117.8 0-213.6 95.8-213.6 213.6 0 37.6 9.8 74.3 28.3 106.7L0 480l130.7-38.4c30.6 16.7 65 25.6 100.4 25.6h.1c117.8 0 213.6-95.8 213.6-213.6 0-58.7-23.1-114.5-65.9-156.5z"/></svg>') no-repeat center;
	background-size: contain;
}

@media (max-width: 768px) {
	.news-title {
		font-size: 22px;
	}
}
</style>
