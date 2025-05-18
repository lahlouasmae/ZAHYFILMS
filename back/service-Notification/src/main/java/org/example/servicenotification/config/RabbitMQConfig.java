package org.example.servicenotification.config;


import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // Configuration pour les vidéos
    public static final String VIDEO_UPLOAD_QUEUE = "videoUploadQueue";
    public static final String EXCHANGE = "videoExchange";
    public static final String ROUTING_KEY = "videoRoutingKey";

    // Configuration pour les notifications de commentaires
    public static final String COMMENT_NOTIFICATION_QUEUE = "commentNotificationQueue";
    public static final String COMMENT_EXCHANGE = "commentExchange";
    public static final String COMMENT_ROUTING_KEY = "commentRoutingKey";

    @Bean
    public Queue videoUploadQueue() {
        return new Queue(VIDEO_UPLOAD_QUEUE, true);
    }

    @Bean
    public Queue commentNotificationQueue() {
        return new Queue(COMMENT_NOTIFICATION_QUEUE, true);
    }
    @Bean
    public DirectExchange exchange() {
        return new DirectExchange(EXCHANGE);
    }

    @Bean
    public DirectExchange commentExchange() {
        return new DirectExchange(COMMENT_EXCHANGE);
    }

    @Bean
    public Binding binding() {
        return BindingBuilder.bind(videoUploadQueue()).to(exchange()).with(ROUTING_KEY);
    }

    @Bean
    public Binding commentBinding() {
        return BindingBuilder.bind(commentNotificationQueue()).to(commentExchange()).with(COMMENT_ROUTING_KEY);
    }

    @Bean
    public Jackson2JsonMessageConverter jackson2JsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jackson2JsonMessageConverter());
        return template;
    }
}

